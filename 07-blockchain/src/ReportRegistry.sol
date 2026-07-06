// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title  GridSense AI — ReportRegistry
/// @notice Anchors a tamper-evidence fingerprint for each finalized monthly energy
///         report. The report DATA never touches the chain — only a SHA-256 hash of
///         the (canonicalized) report, its IPFS CID, an OPAQUE home reference, the
///         billing period, and a timestamp. Anyone can later prove a report was not
///         altered by re-hashing it and comparing to the stored hash.
///
/// @dev    DESIGN GUARANTEES (see 02-strategy/verifiable-reports.md):
///         - NO token, NO coin, NO NFT, NO payable, NO fund custody, NO franc-pegged
///           asset. This contract holds and moves zero value. It is pure notarization,
///           NOT a "virtual asset business" under Rwanda Law N° 023/2026.
///         - NO personal or consumption data on-chain (Rwanda Law N° 058/2021):
///           `homeRef` is an opaque keccak commitment, never a name/meter/address.
///         - Append-only: once a (home, period) report is anchored it CANNOT be
///           overwritten — that immutability is the whole point.
///         - Testnet PoC. Access control is intentionally minimal but real.
contract ReportRegistry {
    // ---------------------------------------------------------------------
    // Types
    // ---------------------------------------------------------------------

    /// @notice One anchored report fingerprint. `timestamp == 0` means "not anchored".
    struct Record {
        bytes32 sha256Hash;   // SHA-256 of the canonicalized report JSON (off-chain)
        string  ipfsCid;      // IPFS CID of the ENCRYPTED report file (a content hash)
        bytes32 homeRef;      // OPAQUE home reference — never personal data
        uint32  periodYYYYMM; // billing period, e.g. 202607
        uint64  timestamp;    // block time when anchored (set by the chain)
        address anchorer;     // who submitted the anchor (the GridSense relayer)
    }

    // ---------------------------------------------------------------------
    // Storage
    // ---------------------------------------------------------------------

    /// @notice reportId => fingerprint record. reportId is normally
    ///         computeReportId(homeRef, periodYYYYMM).
    mapping(bytes32 => Record) private _records;

    /// @notice total number of reports anchored (for demos / indexing).
    uint256 public totalAnchored;

    /// @notice contract owner (deployer) — can manage the anchorer allowlist only.
    address public owner;

    /// @notice addresses permitted to anchor. Prevents a griefer from front-running a
    ///         (home, period) slot with a bogus hash and blocking the real anchor.
    ///         This is access control over WRITES ONLY — it grants no funds/assets.
    mapping(address => bool) public isAnchorer;

    // ---------------------------------------------------------------------
    // Events
    // ---------------------------------------------------------------------

    /// @notice Emitted once per successful anchor. Indexed for cheap lookups/verify.
    event ReportAnchored(
        bytes32 indexed reportId,
        bytes32 indexed homeRef,
        uint32  indexed periodYYYYMM,
        bytes32 sha256Hash,
        string  ipfsCid,
        uint64  timestamp,
        address anchorer
    );

    event AnchorerUpdated(address indexed account, bool allowed);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // ---------------------------------------------------------------------
    // Errors (cheaper + clearer than string reverts)
    // ---------------------------------------------------------------------

    error NotOwner();
    error NotAnchorer();
    error EmptyHash();
    error EmptyCid();
    error AlreadyAnchored(bytes32 reportId);
    error NotAnchored(bytes32 reportId);
    error ZeroAddress();

    // ---------------------------------------------------------------------
    // Modifiers
    // ---------------------------------------------------------------------

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    // ---------------------------------------------------------------------
    // Constructor
    // ---------------------------------------------------------------------

    constructor() {
        owner = msg.sender;
        isAnchorer[msg.sender] = true; // deployer/relayer can anchor by default
        emit OwnershipTransferred(address(0), msg.sender);
        emit AnchorerUpdated(msg.sender, true);
    }

    // ---------------------------------------------------------------------
    // Core: anchor
    // ---------------------------------------------------------------------

    /// @notice Anchor a report fingerprint. Idempotent by design: reverts on a
    ///         duplicate reportId (append-only) and on an empty hash/CID.
    /// @param reportId      unique key; use computeReportId(homeRef, periodYYYYMM).
    /// @param sha256Hash    SHA-256 of the canonicalized report (must be non-zero).
    /// @param ipfsCid       IPFS CID of the encrypted report file (must be non-empty).
    /// @param homeRef       opaque home reference (never personal data).
    /// @param periodYYYYMM  billing period, e.g. 202607.
    function anchorReport(
        bytes32 reportId,
        bytes32 sha256Hash,
        string calldata ipfsCid,
        bytes32 homeRef,
        uint32  periodYYYYMM
    ) external {
        if (!isAnchorer[msg.sender]) revert NotAnchorer();
        if (sha256Hash == bytes32(0)) revert EmptyHash();
        if (bytes(ipfsCid).length == 0) revert EmptyCid();
        if (_records[reportId].timestamp != 0) revert AlreadyAnchored(reportId);

        _records[reportId] = Record({
            sha256Hash:   sha256Hash,
            ipfsCid:      ipfsCid,
            homeRef:      homeRef,
            periodYYYYMM: periodYYYYMM,
            timestamp:    uint64(block.timestamp),
            anchorer:     msg.sender
        });
        unchecked { totalAnchored++; }

        emit ReportAnchored(
            reportId, homeRef, periodYYYYMM,
            sha256Hash, ipfsCid, uint64(block.timestamp), msg.sender
        );
    }

    // ---------------------------------------------------------------------
    // Views
    // ---------------------------------------------------------------------

    /// @notice Deterministic reportId from an opaque home ref + period.
    ///         Same inputs => same id, on-chain and off-chain.
    function computeReportId(bytes32 homeRef, uint32 periodYYYYMM)
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encode(homeRef, periodYYYYMM));
    }

    /// @notice True iff a report has been anchored under `reportId`.
    function isAnchored(bytes32 reportId) external view returns (bool) {
        return _records[reportId].timestamp != 0;
    }

    /// @notice Read a full anchored record. Reverts if not anchored.
    function getReport(bytes32 reportId) external view returns (Record memory) {
        Record memory r = _records[reportId];
        if (r.timestamp == 0) revert NotAnchored(reportId);
        return r;
    }

    /// @notice Verify a candidate hash against the anchored one.
    /// @return ok true iff the report is anchored AND the stored hash equals `sha256Hash`.
    function verify(bytes32 reportId, bytes32 sha256Hash)
        external
        view
        returns (bool ok)
    {
        Record storage r = _records[reportId];
        return r.timestamp != 0 && r.sha256Hash == sha256Hash;
    }

    // ---------------------------------------------------------------------
    // Admin (write-access only — never funds/assets)
    // ---------------------------------------------------------------------

    function setAnchorer(address account, bool allowed) external onlyOwner {
        if (account == address(0)) revert ZeroAddress();
        isAnchorer[account] = allowed;
        emit AnchorerUpdated(account, allowed);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
