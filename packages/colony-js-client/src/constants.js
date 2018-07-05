/* @flow */

export const WORKER_ROLE = 'WORKER';
export const EVALUATOR_ROLE = 'EVALUATOR';
export const MANAGER_ROLE = 'MANAGER';

export const ROLES = {
  [MANAGER_ROLE]: 0,
  [EVALUATOR_ROLE]: 1,
  [WORKER_ROLE]: 2,
};

export const DEFAULT_DOMAIN_ID = 1;

export const OWNER_ROLE = 'OWNER';
export const ADMIN_ROLE = 'ADMIN';

export const AUTHORITY_ROLES = {
  [OWNER_ROLE]: 0,
  [ADMIN_ROLE]: 1,
};

export const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';

export const PARAMS = {
  ADDRESS: ['address', 'address'],
  AMOUNT: ['amount', 'bigNumber'],
  COUNT: ['count', 'number'],
  DELIVERABLE_HASH: ['deliverableHash', 'ipfsHash'],
  DOMAIN_ID: ['domainId', 'number'],
  DUE_DATE: ['dueDate', 'date'],
  ID: ['id', 'number'],
  ROLE: ['role', 'role'],
  SKILL_ID: ['skillId', 'number'],
  SPEC_HASH: ['specificationHash', 'ipfsHash'],
  TASK_ID: ['taskId', 'number'],
  TOKEN: ['token', 'tokenAddress'],
  USER: ['user', 'address'],
};
