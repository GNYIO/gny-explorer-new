import { joi } from '@gnyio/extended-joi';
import { isDatMaker, isDatName, isDatHash } from '@gnyio/utils';



export async function search(input: string, connection) {

    console.log(`searching for: ${input}`);



    const addressSchema = joi
        .string()
        .address()
        .required();
    const addressReport = joi.validate(input, addressSchema);
    if (!addressReport.error) {
        await navigateTo({ name: 'account-detail', query: { address: input } });
        return;
    }




    const heightSchema = joi
        .string()
        .positiveOrZeroBigInt()
        .required();
    const heightReport = joi.validate(input, heightSchema);
    if (!heightReport.error) {
        try {
            const block = (await connection.value.api.Block.getBlockByHeight(input)).block;
            if (block) {
                await navigateTo({ name: 'block-detail', query: { height: input } });
                return;
            }
        } catch (error) {
            console.log(error.message);
        }
    }



    const assetSchema = joi
        .string()
        .asset()
        .required();
    const assetReport = joi.validate(input, assetSchema);
    if (!assetReport.error) {
        try {
            const asset = (await connection.value.api.Uia.getAsset(input)).asset;
            if (asset) {
                await navigateTo({ name: 'asset-detail', query: { assetName: input } });
                return;
            }
        } catch (err) {
            console.log(err.message);
        }
    }



    const usernameSchema = joi
        .string()
        .username()
        .required();

    const usernameReport = joi.validate(input, usernameSchema);
    if (!usernameReport.error) {
        try {
            const result = await connection.value.api.Account.getAccountByUsername(input);
            if (result.success === true && result.address) {
                await navigateTo({ name: 'account-detail', query: { username: input } });
                return;
            }
        } catch (error) {
            console.log(error.message);
        }
    }

    if (input.length === 64) {
        // could be a block id
        try {
            const block = (await connection.value.api.Block.getBlockById(input)).block;
            if (block) {
                await navigateTo({ name: 'block-detail', query: { height: block.height } });
                return;
            }
        } catch (error) {
            console.log(error.message);
        }

        // could be a transaction id
        try {
            const trsQuery = {
                id: input,
            }
            const transaction = (await connection.value.api.Transaction.getTransactions(trsQuery)).transactions[0];
            if (transaction) {
                await navigateTo({ name: 'transaction-detail', query: { id: input } });
                return;
            }
        } catch (error) {
            console.log(error.message);
        }

        // could be a delegate public key
        try {
            const delegate = (await connection.value.api.Delegate.getDelegateByPubKey(input)).delegate
            if (delegate) {
                await navigateTo({ name: 'delegate-detail', query: { publicKey: input } });
                return;
            }
        } catch (err) {
            console.log(err.message);
        }
    }

    if (isDatMaker(input)) {
        try {
            const datMaker = (await connection.value.api.Dat.getSingleDatMaker(input)).maker;
            if (datMaker) {
                await navigateTo({ name: 'dat-maker-detail', query: { makerId: input } });
                return;
            }
        } catch (err) {
            console.log(err.message);
        }
    }


    if (isDatName(input)) {
        try {
            const dat = (await connection.value.api.Dat.getSingleDat({
                name: input
            })).dat;
            if (dat) {
                await navigateTo({ name: 'dat-detail', query: { name: input } });
                return;
            }
        } catch (err) {
            console.log(err.message);
        }
    }

    if (isDatHash(input)) {
        try {
            const dat = (await connection.value.api.Dat.getSingleDat({
                hash: input
            })).dat;
            if (dat) {
                await navigateTo({ name: 'dat-detail', query: { hash: input } });
                return;
            }
        } catch (err) {
            console.log(err.message);
        }
    }

    // add delegate-detail

    await navigateTo({ name: 'search' });
}
