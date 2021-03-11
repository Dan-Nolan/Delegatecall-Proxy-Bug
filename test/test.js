const { assert } = require("chai");
const lendingPoolAddress = "0x987115C38Fd9Fd2aA2c6F1718451D167c13a3186";

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
});
