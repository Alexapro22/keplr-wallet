import { VaultService, PlainObject, Vault } from "../vault";
import { Buffer } from "buffer/";
import { Hash, PrivKeySecp256k1, PubKeySecp256k1 } from "@keplr-wallet/crypto";
import { Env } from "@keplr-wallet/router";

export class KeyRingPrivateKeyService {
  constructor(protected readonly vaultService: VaultService) {}

  async init(): Promise<void> {
    // TODO: ?
  }

  supportedKeyRingType(): string {
    return "private-key";
  }

  createKeyRingVault(
    _: Env,
    privateKey: Uint8Array
  ): Promise<{
    insensitive: PlainObject;
    sensitive: PlainObject;
  }> {
    if (!privateKey || privateKey.length === 0) {
      throw new Error("Invalid arguments");
    }

    const publicKey = Buffer.from(
      new PrivKeySecp256k1(privateKey).getPubKey().toBytes()
    ).toString("hex");

    return Promise.resolve({
      insensitive: {
        publicKey,
      },
      sensitive: {
        privateKey: Buffer.from(privateKey).toString("hex"),
      },
    });
  }

  getPubKey(_: Env, vault: Vault): PubKeySecp256k1 {
    const publicKeyBytes = Buffer.from(
      vault.insensitive["publicKey"] as string,
      "hex"
    );

    return new PubKeySecp256k1(publicKeyBytes);
  }

  sign(
    _: Env,
    vault: Vault,
    _coinType: number,
    data: Uint8Array,
    digestMethod: "sha256" | "keccak256"
  ): Uint8Array {
    const privateKeyText = this.vaultService.decrypt(vault.sensitive)[
      "privateKey"
    ] as string;
    const privateKey = new PrivKeySecp256k1(Buffer.from(privateKeyText, "hex"));

    let digest = new Uint8Array();
    switch (digestMethod) {
      case "sha256":
        digest = Hash.sha256(data);
        break;
      case "keccak256":
        digest = Hash.keccak256(data);
        break;
      default:
        throw new Error(`Unknown digest method: ${digestMethod}`);
    }

    return privateKey.signDigest32(digest);
  }
}
