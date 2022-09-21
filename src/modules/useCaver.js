import * as Caver from 'caver-js/index';
import dotenv from 'dotenv';
dotenv.config();

const FIRST_PRESALE_ADDRESS = '0x2af78D92D7108A2b46188b947482891f34eb2E29';
const CHAIN_ID = '1001'; //MAINNET 8217 TESTNET 1001
const option = {
  headers: [
    {
      name: 'Authorization',
      value: process.env.REACT_APP_KAS_KEY,
    },
    { name: 'x-chain-id', value: CHAIN_ID },
  ],
};

//define caver for call
const caverForCall = new Caver(
  new Caver.providers.HttpProvider(
    'https://node-api.klaytnapi.com/v1/klaytn',
    option,
  ),
);
const soulContract = new caverForCall.contract(
  JSON.parse(process.env.REACT_APP_SOUL_ABI),
  process.env.REACT_APP_SOUL_ADDR,
);

//call
const test = async () => {
  const count = await soulContract.methods.totalSupply().call();
  // console.log(count);
  // alert(count);
  return count;
};

const nftBalanceOf = async address => {
  const result = await soulContract.methods.balanceOf(address).call();
  return result;
};

//sendTx
const buy_test = async nickname => {
  const { klaytn } = window;
  if (klaytn === undefined) {
    alert('카이카스 지갑을 설치해주세요.');
    return;
  }
  if (klaytn.selectedAddress === undefined) {
    alert('지갑을 연결해주세요.');
    return;
  }

  //should add 'try-catch' // 지갑 연결한 상태로 크롬 익스텐션 카이카스지갑에서 연결해제할 경우 예외처리
  const caver = new Caver(klaytn);
  const walletAddress = await klaytn.enable();
  const from = walletAddress[0]; // 이거 enable로 고쳐야할듯?
  const contractAddress = FIRST_PRESALE_ADDRESS;
  const gas = 3000000;
  const mintPrice = 20; // Peb : 20 KLAY

  const data = caver.klay.abi.encodeFunctionCall(
    {
      name: 'nftReceiptMint',
      type: 'function',
      inputs: [{ type: 'string', name: '_nickname' }],
    },
    [nickname],
  );
  caver.klay
    .sendTransaction({
      type: 'SMART_CONTRACT_EXECUTION',
      from: from,
      to: contractAddress,
      data: data,
      gas: gas,
      value: caver.utils.toPeb(mintPrice, 'KLAY'),
    })
    .on('transactionHash', transactionHash => {
      console.log('txHash', transactionHash);
    })
    .on('receipt', receipt => {
      console.log('receipt', receipt);
    })
    .on('error', error => {
      console.log('error', error);
      alert(error);
    });
};

export { test, buy_test, nftBalanceOf };