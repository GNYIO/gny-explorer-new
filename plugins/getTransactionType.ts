export interface IMapping {
  [key: string]: string;
}

const mapping: IMapping = {
  0: 'basic.transfer',
  1: 'basic.setUserName',
  2: 'basic.setSecondPassphrase',
  3: 'basic.lock',
  4: 'basic.vote',
  5: 'basic.unvote',
  6: 'basic.unlock',
  10: 'basic.registerDelegate',
  20: 'basic.burn',

  100: 'uia.registerIssuer',
  101: 'uia.registerAsset',
  102: 'uia.issue',
  103: 'uia.transfer',

  300: 'dat.registerDatMaker',
  301: 'dat.createDat',

  400: 'verify.verify',

};


export function contractMappingFilter(contractNumber: number) {
  if (mapping[contractNumber]) {
    return mapping[contractNumber];
  }

  return 'unknown contract';
}


export default defineNuxtPlugin(() => {
  return {
    provide: {
      contractMappingFilter,
    },
  };
})
