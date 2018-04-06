/* @flow */

import type BigNumber from 'bn.js';
// eslint-disable-next-line max-len
import type { Options as LoaderOptions } from '@colony/colony-js-contract-loader';

import type { IAdapter, InterfaceFn } from '@colony/colony-js-adapter';
import ContractClient from '@colony/colony-js-contract-client';

import type { ColonyContract } from '../interface/ColonyContract';
import ColonyNetworkClient from '../ColonyNetworkClient/index';

import GetTask from './callers/GetTask';

type TransactionEventData = {
  transactionId: number,
  confirmed?: boolean,
  executed?: boolean,
  submitted?: boolean,
};

type Address = string;

export default class ColonyClient extends ContractClient<ColonyContract> {
  contract: ColonyContract;
  networkClient: ColonyNetworkClient;
  /*
    Gets the total number of tasks in a Colony. This number equals the last `taskId` created.
  */
  getTaskCount: ColonyClient.Caller<
    null,
    {
      count: number, // Total number of tasks in this Colony
    },
    ColonyClient,
  >;
  // TODO: Please type explicitly!
  /*
    Gets a certain task defined by its integer taskId
  */
  getTask: GetTask;
  /*
    Given a specific [task](glossary#task) a defined role for the task, (see [roles](glossary#roles)) and an ERC20 Token address (see [tokens](glossary#tokens)), `getTaskPayout` will return any payout attached to the task in the token specified.
  */
  getTaskPayout: ColonyClient.Caller<
    {
      taskId: number, // Integer taskId
      role: number, // Role the payout is specified for
      token: Address, // Adress of the token's ERC20 contract
    },
    {
      amount: number, // Amount of specified tokens to payout for that task and a role
    },
    ColonyClient,
  >;
  /*
    Every task has three roles associated with it which determine permissions for editing the task, submitting work, and ratings for performance.
  */
  getTaskRole: ColonyClient.Caller<
    {
      taskId: number, // Integer taskId
      role: number, // Role (see [roles](glossary#roles))
    },
    {
      address: Address, // Address of the user for the given role
      rated: boolean, // Has the user work been rated
      rating: number, // Rating the user received
    },
    ColonyClient,
  >;
  /*
    For a given task, will return the number of submitted ratings and the timestamp of their submission (see (rating[glossary#work-ratings]))
  */
  getTaskWorkRatings: ColonyClient.Caller<
    {
      taskId: number, // Integer taskId
    },
    {
      count: number, // Total number of submitted ratings for a task.
      timestamp: number, // Timestamp of the last submitted rating.
    },
    ColonyClient,
  >;
  /*
    If ratings for a task are still in the commit period, their ratings will still be hidden, but the hashed value can still be returned.
  */
  getTaskWorkRatingSecret: ColonyClient.Caller<
    {
      taskId: number, // Integer taskId
      role: number, // Role that submitted the rating
    },
    {
      secret: string, // the hashed rating (equivalent to the output of `keccak256(_salt, _rating)`).
    },
    ColonyClient,
  >;
  /*
    Gets a balance for a certain token in a specific pot
  */
  getPotBalance: ColonyClient.Caller<
    {
      potId: number, // Integer potId
      token: Address, // Address of the token's ERC20 contract
    },
    {
      balance: number, // Balance for token `token` in pot `potId`
    },
    ColonyClient,
  >;
  /*
    The `nonRewardPotsTotal` is a value that keeps track of the total assets a colony has to work with, which may be split among several distinct pots associated with various domains and tasks. See [pots](glossary#pots))
  */
  getNonRewardPotsTotal: ColonyClient.Caller<
    {
      address: Address, // Adress of the token's ERC20 contract (token in question)
    },
    {
      total: number, // All tokens that are not within the colony's `rewards` pot.
    },
    ColonyClient,
  >;
  /*
    Gets the address of the colony's official ERC20 token contract
  */
  getToken: ColonyClient.Caller<
    null,
    {
      address: string, // The address of the colony's official deployed ERC20 token contract
    },
    ColonyClient,
  >;
  /*
    TODO: this needs more clarity. On the face of it, this function returns the number of all transactions in this colony, but what this really entails is that it will be returning the `transactionId` of the last added transaction to the Colony.
  */
  getTransactionCount: ColonyClient.Caller<
    null,
    {
      count: number, // Number of all transactions in this Colony; == the last added transactionId
    },
    ColonyClient,
  >;
  /*
    Creates a new task by invoking `makeTask` on-chain. This is the first step in the Task lifecycle; see [tasks](glossary#tasks) for a complete description.
  */
  createTask: ColonyClient.Sender<
    {
      specificationHash: string, // Hashed output of the task's work specification, stored so that it can later be referenced for task ratings or in the event of a dispute.
      domainId: number, // Domain in which the task has been created.
    },
    {
      taskId: number, // Will return an integer taskId, from the `TaskAdded` event.
    },
    ColonyClient,
  >;
  /*
    The task brief, or specification, is a description of the tasks work specification. The description is hashed and stored with the task for future reference in ratings or in the event of a dispute.
  */
  setTaskBrief: ColonyClient.Sender<
    {
      taskId: number, // Integer taskId
      specificationHash: string, // digest of the task's hashed specification.
    },
    TransactionEventData,
    ColonyClient,
  >;
  /*
    Every task must belong to a single existing Domain.
  */
  setTaskDomain: ColonyClient.Sender<
    {
      taskId: number, // Integer taskId
      domainId: number, // Integer domainId
    },
    null,
    ColonyClient,
  >;
  /*
    The task's due date determines when a worker may submit the task's deliverable(s)
  */
  setTaskDueDate: ColonyClient.Sender<
    {
      taskId: number, // Integer taskId
      dueDate: number, // Integer due date
    },
    TransactionEventData,
    ColonyClient,
  >;
  /*
    Set the user for role `_role` in task `_id`. Only allowed before the task is `finalized`, meaning that the value cannot be changed after the task is complete.
  */
  setTaskRoleUser: ColonyClient.Sender<
    {
      taskId: number, // Integer taskId
      role: number, // MANAGER (`0`), EVALUATOR (`1`), or WORKER (`2`)
      user: string, // address of the user
    },
    null,
    ColonyClient,
  >;
  /*
  Sets the skill tag associated with the task. Currently there is only one skill tag available per task, but additional skills for tasks are planned in future implementations.
  */
  setTaskSkill: ColonyClient.Sender<
    {
      taskId: number, // Integer taskId
      skillId: number, // Integer skillId
    },
    null,
    ColonyClient,
  >;
  /*
    Sets the payout given to the EVALUATOR role when the task is finalized.
  */
  setTaskEvaluatorPayout: ColonyClient.Sender<
    {
      taskId: number, // Integer taskId
      token: string, // Address of the token's ERC20 contract.
      amount: number, // Amount to be paid.
    },
    TransactionEventData,
    ColonyClient,
  >;
  /*
    Sets the payout given to the MANAGER role when the task is finalized.
  */
  setTaskManagerPayout: ColonyClient.Sender<
    {
      taskId: number, // Integer taskId
      token: string, // Address of the token's ERC20 contract.
      amount: number, // Amount to be paid.
    },
    TransactionEventData,
    ColonyClient,
  >;
  /*
    Sets the payout given to the WORKER role when the task is finalized.
  */
  setTaskManagerPayout: ColonyClient.Sender<
    {
      taskId: number, // Integer taskId
      token: string, // Address of the token's ERC20 contract.
      amount: number, // Amount to be paid.
    },
    TransactionEventData,
    ColonyClient,
  >;
  /*
    Submit the task deliverable, i.e. the output of the work performed for task `_id` Submission is allowed only to the assigned worker before the task due date. Submissions cannot be overwritten
  */
  submitTaskDeliverable: ColonyClient.Sender<
    {
      taskId: number, // Integer taskId
      deliverableHash: string, // Hash of the work performed
    },
    null,
    ColonyClient,
  >;
  /*
    Submits a hidden work rating for a task. This is generated by generateSecret(_salt, _rating).
  */
  submitTaskWorkRating: ColonyClient.Sender<
    {
      taskId: number, // Integer taskId
      role: number, // The role submitting their rating, either EVALUATOR (`1`) or WORKER (`2`)
      ratingSecret: string, // hidden work rating, generated as the output of generateSecret(_salt, _rating)
    },
    null,
    ColonyClient,
  >;
  /*
    Reveals a previously submitted work rating, by proving that the `_rating` and `_salt` values result in the same `ratingSecret` submitted during the rating submission period. This is checked on-chain using the `generateSecret` function. See [Work Ratings](glossary#work-ratings) for more info.
  */
  revealTaskWorkRating: ColonyClient.Sender<
    {
      taskId: number, // Integer taskId
      role: number, // Role revealing their rating submission, either EVALUATOR (`1`) or WORKER (`2`)
      rating: number, // TODO: is the rating going to change to between 0 and 3 or remain 5 stars?
      salt: string, // `_salt` value to be used in `generateSecret`. A correct value will result in the same `ratingSecret` submitted during the work rating submission period.
    },
    null,
    ColonyClient,
  >;
  /*
    Approves a task change for execution. See TODO: Gnosis multi-sig wallet explanation -- also this function doesn't appear to be in the /develop branch anymore...
  */
  approveTaskChange: ColonyClient.Sender<
    {
      transactionId: number, // transactionId of the task change to be approved.
      role: number, // TODO: Why is this necessary? Can we find out?
    },
    TransactionEventData,
    ColonyClient,
  >;
  /*
  In the event of a user not committing or revealing within the 10 day rating window, their rating of their counterpart is assumed to be the highest possible and their own rating is decreased by 5 (e.g. 0.5 points). This function may be called by anyone after the taskWorkRatings period has ended.
  */
  assignWorkRating: ColonyClient.Sender<
    {
      taskId: number, // Integer taskId
      rating: number, // TODO: is this really a parameter? doesn't seem like it should be as the function in `ColonyTask.sol` only has one arg...
    },
    null,
    ColonyClient,
  >;
  /*
    Cancels a task.
  */
  cancelTask: ColonyClient.Sender<
    {
      taskId: number, // Integer taskId
    },
    null,
    ColonyClient,
  >;
  /*
    Finalizes a task, allowing roles to claim payouts and prohibiting all further changes to the task.
  */
  finalizeTask: ColonyClient.Sender<
    {
      taskId: number, // Integer taskId
    },
    null,
    ColonyClient,
  >;
  /*
    Claims the payout in `_token` denomination for work completed in task `_id` by contributor with role `_role`. Allowed only by the contributors themselves after task is finalized. Here the network receives its fee from each payout. Ether fees go straight to the Common Colony whereas Token fees go to the Network to be auctioned off.
  */
  claimPayout: ColonyClient.Sender<
    {
      taskId: number, // Integer taskId
      role: number, // Role of the contributor claiming the payout.
      token: string, // Address of the ERC20 token contract
    },
    null,
    ColonyClient,
  >;
  /*
    TODO: Adds a domain to this Colony. Please verify all input and output values. We should probably explain why this requires skill ids
  */
  addDomain: ColonyClient.Sender<
    {
      parentSkillId: number, // TODO: Why do I have to define a skill for a domain? No idea
    },
    {
      skillId: number, // A skillId for this domain
      parentSkillId: number, // The parent skill id
    },
    ColonyClient,
  >;
  /*
    TODO: Adds a global skill. Whatever that means.
  */
  addGlobalSkill: ColonyClient.Sender<
    {
      parentSkillId: number, // Integer id of the parent skill
    },
    {
      skillId: number, // Integer id of the newly created skill
      parentSkillId: number, // Integer id of the parent skill
    },
    ColonyClient,
  >;
  /*
    Claims funds that are in the Colony's rewards pot. See [pots](glossary#pots) for mor info.
  */
  claimColonyFunds: ColonyClient.Sender<
    {
      token: string, // Address of the ERC20 token contract
    },
    null,
    ColonyClient,
  >;
  /*
      Moves funds between pots in a Colony. See [pots](glossary#pots) for more info.
    */
  moveFundsBetweenPots: ColonyClient.Sender<
    {
      fromPot: number, // Origin pot
      toPot: number, // Destination pot
      amount: number, // Amount of funds to move
      address: string, // Address of the ERC20 token contract
    },
    null,
    ColonyClient,
  >;
  /*
    The owner of a Colony may mint new tokens.
  */
  mintTokens: ColonyClient.Sender<
    {
      amount: number, // amount to be minted
    },
    null,
    ColonyClient,
  >;
  /*
    In the case of the Colony Network, only the Common Colony may mint new tokens
  */
  mintTokensForColonyNetwork: ColonyClient.Sender<
    {
      amount: number, // Tokens to be minted
    },
    null,
    ColonyClient,
  >;
  // When we create a Colony, we get back the address of a newly-deployed
  // EtherRouter contract (we think).
  static async create(
    adapter: IAdapter<ColonyContract>,
    contractName: string,
    loaderOptions: LoaderOptions,
    networkClient: ColonyNetworkClient,
  ) {
    const contract = await adapter.getContract(contractName, loaderOptions);
    return new this({ adapter, contract, networkClient });
  }
  static async createSelf(
    adapter: IAdapter<ColonyContract>,
    networkClient: ColonyNetworkClient,
    loaderOptions: LoaderOptions,
  ) {
    return this.create(adapter, 'IColony', loaderOptions, networkClient);
  }
  constructor({
    adapter,
    contract,
    networkClient,
  }: {
    adapter: IAdapter<ColonyContract>,
    contract: ColonyContract,
    networkClient: ColonyNetworkClient,
  }) {
    super({ adapter, contract, options: { networkClient } });
    this.getTask = new GetTask(this);
  }
  getCallerDefs(): * {
    return {
      getNonRewardPotsTotal: {
        call: this.contract.functions.getNonRewardPotsTotal,
        params: [['address', 'address']],
        returnValues: [['total', 'number']],
      },
      getPotBalance: {
        call: this.contract.functions.getPotBalance,
        params: [['potId', 'number'], ['token', 'address']],
        returnValues: [['balance', 'number']],
      },
      getTaskCount: {
        call: this.contract.functions.getTaskCount,
        returnValues: [['count', 'number']],
      },
      getTaskPayout: {
        call: this.contract.functions.getPotBalance,
        params: [
          ['taskId', 'number'],
          ['role', 'number'],
          ['token', 'address'],
        ],
        returnValues: [['amount', 'number']],
      },
      getTaskRole: {
        call: this.contract.functions.getTaskRole,
        params: [['taskId', 'number'], ['role', 'number']],
        returnValues: [
          ['address', 'address'],
          ['rated', 'boolean'],
          ['rating', 'number'],
        ],
      },
      getTaskWorkRatings: {
        call: this.contract.functions.getTaskWorkRatings,
        params: [['taskId', 'number']],
        returnValues: [['count', 'number'], ['timestamp', 'number']],
      },
      getTaskWorkRatingSecret: {
        call: this.contract.functions.getTaskWorkRatingSecret,
        params: [['taskId', 'number'], ['role', 'number']],
        returnValues: [['secret', 'string']],
      },
      getToken: {
        call: this.contract.functions.getToken,
        returnValues: [['address', 'address']],
      },
      getTransactionCount: {
        call: this.contract.functions.getTransactionCount,
        returnValues: [['count', 'number']],
      },
    };
  }
  getSenderDefs({
    networkClient,
  }: { networkClient: ColonyNetworkClient } = {}): * {
    const SkillAdded = {
      contract: networkClient.contract,
      handler({
        parentSkillId,
        skillId,
      }: {
        parentSkillId: BigNumber,
        skillId: BigNumber,
      }) {
        return {
          parentSkillId: parentSkillId.toNumber(),
          skillId: skillId.toNumber(),
        };
      },
    };

    const Confirmation = {
      contract: this.contract,
      handler({ transactionId }: { transactionId: BigNumber }) {
        return {
          transactionId: transactionId.toNumber(),
          confirmed: true,
        };
      },
    };
    const Execution = {
      contract: this.contract,
      handler({ transactionId }: { transactionId: BigNumber }) {
        return {
          transactionId: transactionId.toNumber(),
          executed: true,
        };
      },
    };
    const Submission = {
      contract: this.contract,
      handler({ transactionId }: { transactionId: BigNumber }) {
        return {
          transactionId: transactionId.toNumber(),
          submitted: true,
        };
      },
    };
    const ExecutionFailure = {
      contract: this.contract,
      handler({ transactionId }: { transactionId: BigNumber }) {
        throw new Error(
          `Transaction ${transactionId.toNumber()} failed to be executed`,
        );
      },
    };

    const proposeTaskChange = ({
      getData,
      params,
    }: {
      getData: InterfaceFn<*>,
      params: *,
    }) => ({
      send: this.contract.functions.proposeTaskChange,
      estimate: this.contract.estimate.proposeTaskChange,
      getArgs(parameters: {}): Array<*> {
        const args = this.constructor.getArgs(parameters);
        const role = args.pop();
        const { data } = getData(...args);
        return [data, 0, role]; // 0 == Transaction value
      },
      params,
      eventHandlers: {
        success: {
          Submission,
          Confirmation,
        },
      },
    });

    return {
      addDomain: {
        send: this.contract.functions.addDomain,
        estimate: this.contract.estimate.addDomain,
        params: [['domainId', 'number']],
        eventHandlers: {
          success: { SkillAdded },
        },
      },
      addGlobalSkill: {
        send: this.contract.functions.addGlobalSkill,
        estimate: this.contract.estimate.addGlobalSkill,
        params: [['parentSkillId', 'number']],
        eventHandlers: {
          success: { SkillAdded },
        },
      },
      approveTaskChange: {
        send: this.contract.functions.approveTaskChange,
        estimate: this.contract.estimate.approveTaskChange,
        params: [['transaction', 'number'], ['role', 'number']],
        eventHandlers: {
          success: {
            Confirmation,
            Execution,
          },
          error: {
            ExecutionFailure,
          },
        },
      },
      assignWorkRating: {
        send: this.contract.functions.assignWorkRating,
        estimate: this.contract.estimate.assignWorkRating,
        params: [['taskId', 'number']],
      },
      cancelTask: {
        send: this.contract.functions.cancelTask,
        estimate: this.contract.estimate.cancelTask,
        params: [['taskId', 'number']],
      },
      claimColonyFunds: {
        send: this.contract.functions.claimColonyFunds,
        estimate: this.contract.estimate.claimColonyFunds,
        params: [['token', 'address']],
      },
      claimPayout: {
        send: this.contract.functions.claimPayout,
        estimate: this.contract.estimate.claimPayout,
        params: [
          ['token', 'address'],
          ['role', 'number'],
          ['token', 'address'],
        ],
      },
      createTask: {
        send: this.contract.functions.makeTask,
        estimate: this.contract.estimate.makeTask,
        params: [['specificationHash', 'string'], ['domainId', 'number']],
        eventHandlers: {
          success: {
            TaskAdded: {
              contract: this.contract,
              handler({ id }: { id: * }) {
                return {
                  taskId: id.toNumber(),
                };
              },
            },
          },
        },
      },
      finalizeTask: {
        send: this.contract.functions.finalizeTask,
        estimate: this.contract.estimate.finalizeTask,
        params: [['taskId', 'number']],
      },
      mintTokens: {
        send: this.contract.functions.mintTokens,
        estimate: this.contract.estimate.mintTokens,
        params: [['amount', 'number']],
      },
      mintTokensForColonyNetwork: {
        send: this.contract.functions.mintTokensForColonyNetwork,
        estimate: this.contract.estimate.mintTokensForColonyNetwork,
        params: [['amount', 'number']],
      },
      moveFundsBetweenPots: {
        send: this.contract.functions.moveFundsBetweenPots,
        estimate: this.contract.estimate.moveFundsBetweenPots,
        params: [
          ['fromPot', 'number'],
          ['toPot', 'number'],
          ['amount', 'number'],
          ['address', 'address'],
        ],
      },
      revealTaskWorkRating: {
        send: this.contract.functions.revealTaskWorkRating,
        estimate: this.contract.estimate.revealTaskWorkRating,
        params: [
          ['taskId', 'number'],
          ['role', 'number'],
          ['rating', 'number'],
          ['salt', 'string'],
        ],
      },
      setTaskBrief: proposeTaskChange({
        getData: this.contract.interface.functions.setTaskBrief,
        params: [
          ['taskId', 'number'],
          ['specificationHash', 'address'],
          ['role', 'number'],
        ],
      }),
      setTaskDomain: {
        send: this.contract.functions.setTaskDomain,
        estimate: this.contract.estimate.setTaskDomain,
        params: [['taskId', 'number'], ['domainId', 'number']],
      },
      setTaskDueDate: proposeTaskChange({
        getData: this.contract.interface.functions.setTaskDueDate,
        params: [
          ['taskId', 'number'],
          ['dueDate', 'number'],
          ['role', 'number'],
        ],
      }),
      setTaskRoleUser: {
        send: this.contract.functions.setTaskRoleUser,
        estimate: this.contract.estimate.setTaskRoleUser,
        params: [['taskId', 'number'], ['role', 'number'], ['user', 'address']],
      },
      setTaskSkill: {
        send: this.contract.functions.setTaskSkill,
        estimate: this.contract.estimate.setTaskSkill,
        params: [['taskId', 'number'], ['skillId', 'number']],
      },
      setTaskEvaluatorPayout: proposeTaskChange({
        getData: this.contract.interface.functions.setTaskEvaluatorPayout,
        params: [
          ['taskId', 'number'],
          ['token', 'address'],
          ['amount', 'number'],
          ['role', 'number'],
        ],
      }),
      setTaskManagerPayout: proposeTaskChange({
        getData: this.contract.interface.functions.setTaskManagerPayout,
        params: [
          ['taskId', 'number'],
          ['token', 'address'],
          ['amount', 'number'],
          ['role', 'number'],
        ],
      }),
      setTaskWorkerPayout: proposeTaskChange({
        getData: this.contract.interface.functions.setTaskWorkerPayout,
        params: [
          ['taskId', 'number'],
          ['token', 'address'],
          ['amount', 'number'],
          ['role', 'number'],
        ],
      }),
      submitTaskDeliverable: {
        send: this.contract.functions.submitTaskDeliverable,
        estimate: this.contract.estimate.submitTaskDeliverable,
        params: [['taskId', 'number'], ['deliverableHash', 'string']],
      },
      submitTaskWorkRating: {
        send: this.contract.functions.submitTaskWorkRating,
        estimate: this.contract.estimate.submitTaskWorkRating,
        params: [
          ['taskId', 'number'],
          ['role', 'number'],
          ['ratingSecret', 'string'],
        ],
      },
    };
  }
}