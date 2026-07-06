// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ReportRegistry} from "../src/ReportRegistry.sol";

/// @dev Full behavioural spec for ReportRegistry. Run: `forge test -vvv`.
contract ReportRegistryTest is Test {
    ReportRegistry reg;

    // Fixed, opaque test fixtures (NOT personal data).
    bytes32 constant HOME  = keccak256("opaque-home-ref-demo-salted");
    uint32  constant PERIOD = 202607;
    bytes32 constant HASH  = keccak256("canonicalized-report-bytes"); // stands in for a SHA-256
    string  constant CID   = "bafkreigh2akiscaildcqabsyg3dfr6chu3fgpregiymsck7e7aqa4s52zy";

    address relayer = address(this); // deployer == default anchorer
    address stranger = address(0xBEEF);

    function setUp() public {
        reg = new ReportRegistry();
    }

    // --- anchor -> read back --------------------------------------------------

    function test_AnchorThenReadBack() public {
        bytes32 id = reg.computeReportId(HOME, PERIOD);
        reg.anchorReport(id, HASH, CID, HOME, PERIOD);

        assertTrue(reg.isAnchored(id), "should be anchored");
        assertEq(reg.totalAnchored(), 1);

        ReportRegistry.Record memory r = reg.getReport(id);
        assertEq(r.sha256Hash, HASH);
        assertEq(r.ipfsCid, CID);
        assertEq(r.homeRef, HOME);
        assertEq(uint256(r.periodYYYYMM), uint256(PERIOD));
        assertEq(r.anchorer, relayer);
        assertGt(uint256(r.timestamp), 0);
    }

    function test_EmitsReportAnchoredEvent() public {
        bytes32 id = reg.computeReportId(HOME, PERIOD);
        vm.expectEmit(true, true, true, false);
        emit ReportRegistry.ReportAnchored(id, HOME, PERIOD, HASH, CID, uint64(block.timestamp), relayer);
        reg.anchorReport(id, HASH, CID, HOME, PERIOD);
    }

    // --- idempotency: reject duplicate ---------------------------------------

    function test_RejectDuplicate() public {
        bytes32 id = reg.computeReportId(HOME, PERIOD);
        reg.anchorReport(id, HASH, CID, HOME, PERIOD);

        vm.expectRevert(abi.encodeWithSelector(ReportRegistry.AlreadyAnchored.selector, id));
        reg.anchorReport(id, HASH, CID, HOME, PERIOD);

        // even a DIFFERENT hash for the same id is rejected (append-only immutability)
        vm.expectRevert(abi.encodeWithSelector(ReportRegistry.AlreadyAnchored.selector, id));
        reg.anchorReport(id, keccak256("tampered"), CID, HOME, PERIOD);

        assertEq(reg.totalAnchored(), 1, "no double count");
    }

    // --- reject empty inputs --------------------------------------------------

    function test_RejectEmptyHash() public {
        bytes32 id = reg.computeReportId(HOME, PERIOD);
        vm.expectRevert(ReportRegistry.EmptyHash.selector);
        reg.anchorReport(id, bytes32(0), CID, HOME, PERIOD);
    }

    function test_RejectEmptyCid() public {
        bytes32 id = reg.computeReportId(HOME, PERIOD);
        vm.expectRevert(ReportRegistry.EmptyCid.selector);
        reg.anchorReport(id, HASH, "", HOME, PERIOD);
    }

    // --- access control -------------------------------------------------------

    function test_RejectNonAnchorer() public {
        bytes32 id = reg.computeReportId(HOME, PERIOD);
        vm.prank(stranger);
        vm.expectRevert(ReportRegistry.NotAnchorer.selector);
        reg.anchorReport(id, HASH, CID, HOME, PERIOD);
    }

    function test_OwnerCanGrantAnchorer() public {
        bytes32 id = reg.computeReportId(HOME, PERIOD);
        reg.setAnchorer(stranger, true);
        vm.prank(stranger);
        reg.anchorReport(id, HASH, CID, HOME, PERIOD); // now allowed
        assertTrue(reg.isAnchored(id));
    }

    function test_NonOwnerCannotGrant() public {
        vm.prank(stranger);
        vm.expectRevert(ReportRegistry.NotOwner.selector);
        reg.setAnchorer(stranger, true);
    }

    // --- verify: the whole point ---------------------------------------------

    function test_VerifyTrueForUntampered() public {
        bytes32 id = reg.computeReportId(HOME, PERIOD);
        reg.anchorReport(id, HASH, CID, HOME, PERIOD);
        assertTrue(reg.verify(id, HASH), "correct hash must verify");
    }

    function test_VerifyFalseForTampered() public {
        bytes32 id = reg.computeReportId(HOME, PERIOD);
        reg.anchorReport(id, HASH, CID, HOME, PERIOD);
        assertFalse(reg.verify(id, keccak256("tampered")), "wrong hash must fail");
    }

    function test_VerifyFalseForUnknown() public view {
        bytes32 id = reg.computeReportId(HOME, PERIOD);
        assertFalse(reg.verify(id, HASH), "unanchored must not verify");
    }

    function test_GetReportRevertsWhenAbsent() public {
        bytes32 id = reg.computeReportId(HOME, PERIOD);
        vm.expectRevert(abi.encodeWithSelector(ReportRegistry.NotAnchored.selector, id));
        reg.getReport(id);
    }

    // --- determinism ----------------------------------------------------------

    function test_ReportIdDeterministic() public view {
        assertEq(
            reg.computeReportId(HOME, PERIOD),
            reg.computeReportId(HOME, PERIOD),
            "same inputs => same id"
        );
        assertTrue(
            reg.computeReportId(HOME, PERIOD) != reg.computeReportId(HOME, 202608),
            "different period => different id"
        );
    }

    // --- no value custody: contract must reject ETH --------------------------

    function test_RejectsEther() public {
        (bool sent, ) = address(reg).call{value: 1 ether}("");
        assertFalse(sent, "contract holds no funds: ETH must bounce");
    }
}
