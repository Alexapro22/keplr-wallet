import {
  action,
  autorun,
  makeObservable,
  observable,
  runInAction,
  toJS,
} from "mobx";
import { KVStore, PrefixKVStore } from "@keplr-wallet/common";
import { simpleFetch } from "@keplr-wallet/simple-fetch";
import Joi from "joi";

interface VersionHistory {
  version: string;
  scenes: {
    image?: string;
    aspectRatio?: string;
    paragraph: string;
  }[];
}

const Schema = Joi.object<{
  versions: VersionHistory[];
}>({
  versions: Joi.array()
    .items(
      Joi.object({
        version: Joi.string().required(),
        scenes: Joi.array()
          .items(
            Joi.object({
              image: Joi.string().optional(),
              aspectRatio: Joi.string().optional(),
              paragraph: Joi.string().required(),
            })
          )
          .min(1)
          .required(),
      })
    )
    .required(),
});

export class ChangelogConfig {
  protected readonly kvStore: KVStore;

  @observable.ref
  protected _lastInfo:
    | {
        lastVersion: string;
        currentVersion: string;
        cleared: boolean;
        histories: VersionHistory[];
      }
    | undefined = undefined;

  constructor(kvStore: KVStore) {
    this.kvStore = new PrefixKVStore(kvStore, "change-log-config");

    makeObservable(this);
  }

  async init(lastVersion: string, currentVersion: string): Promise<void> {
    {
      const saved = await this.kvStore.get<ChangelogConfig["_lastInfo"]>(
        "lastInfo"
      );
      if (saved) {
        runInAction(() => {
          this._lastInfo = saved;
        });
      }
    }

    if (lastVersion !== currentVersion) {
      // should not ignore
      this.fetchVersion(lastVersion, currentVersion);
    }

    autorun(() => {
      this.kvStore.set<ChangelogConfig["_lastInfo"]>(
        "lastInfo",
        toJS(this._lastInfo)
      );
    });
  }

  protected async fetchVersion(
    lastVersion: string,
    currentVersion: string
  ): Promise<void> {
    try {
      const res = await simpleFetch<{
        versions: VersionHistory[];
      }>(
        process.env["KEPLR_EXT_CONFIG_SERVER"],
        `/changelog/${lastVersion}/${currentVersion}`
      );

      const validated = await Schema.validateAsync(res.data);
      runInAction(() => {
        this._lastInfo = {
          lastVersion,
          currentVersion,
          cleared: false,
          histories: validated.versions,
        };
      });
    } catch (e) {
      // ignore error
      console.log(e);
    }
  }

  @action
  clearLastInfo() {
    if (this._lastInfo) {
      this._lastInfo = {
        ...this._lastInfo,
        cleared: true,
      };
    }
  }

  get showingInfo(): VersionHistory[] {
    if (!this._lastInfo) {
      return [];
    }
    if (this._lastInfo.cleared) {
      return [];
    }
    return this._lastInfo.histories;
  }
}
