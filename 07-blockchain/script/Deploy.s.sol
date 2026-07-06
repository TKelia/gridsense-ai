// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {ReportRegistry} from "../src/ReportRegistry.sol";

/// @dev Deploys ReportRegistry. Signer = env PRIVATE_KEY (the relayer key).
///      Local:        forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast
///      Base Sepolia: forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast --verify
contract Deploy is Script {
    function run() external returns (ReportRegistry reg) {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);
        reg = new ReportRegistry();
        vm.stopBroadcast();
        console2.log("ReportRegistry deployed at:", address(reg));
        console2.log("owner / default anchorer:", reg.owner());
    }
}
