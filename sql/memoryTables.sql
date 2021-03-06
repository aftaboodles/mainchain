/* Shift Memory Tables
 *
 */

BEGIN;

CREATE TABLE IF NOT EXISTS "mem_accounts"(
  "username" VARCHAR(20),
  "isDelegate" SMALLINT DEFAULT 0,
  "u_isDelegate" SMALLINT DEFAULT 0,
  "secondSignature" SMALLINT DEFAULT 0,
  "u_secondSignature" SMALLINT DEFAULT 0,
  "u_username" VARCHAR(20),
  "address" VARCHAR(22) NOT NULL UNIQUE PRIMARY KEY,
  "publicKey" BYTEA,
  "secondPublicKey" BYTEA,
  "balance" BIGINT DEFAULT 0,
  "u_balance" BIGINT DEFAULT 0,
  "vote" BIGINT DEFAULT 0,
  "ranking" BIGINT DEFAULT 0,
  "rate" BIGINT DEFAULT 0,
  "delegates" TEXT,
  "u_delegates" TEXT,
  "rankings" TEXT,
  "u_rankings" TEXT,
  "multisignatures" TEXT,
  "u_multisignatures" TEXT,
  "multimin" BIGINT DEFAULT 0,
  "u_multimin" BIGINT DEFAULT 0,
  "multilifetime" BIGINT DEFAULT 0,
  "u_multilifetime" BIGINT DEFAULT 0,
  "blockId" VARCHAR(20),
  "nameexist" SMALLINT DEFAULT 0,
  "u_nameexist" SMALLINT DEFAULT 0,
  "producedblocks" int DEFAULT 0,
  "missedblocks" int DEFAULT 0,
  "fees" BIGINT DEFAULT 0,
  "rewards" BIGINT DEFAULT 0,
  "virgin" SMALLINT DEFAULT 1,
  "status" SMALLINT DEFAULT 0,
  "u_status" SMALLINT DEFAULT 0,
  "ac_status" TEXT,
  "u_ac_status" TEXT
);

CREATE INDEX IF NOT EXISTS "mem_accounts_balance" ON "mem_accounts"("balance");

CREATE TABLE IF NOT EXISTS "mem_round"(
  "address" VARCHAR(22),
  "amount" BIGINT,
  "delegate" VARCHAR(64),
  "blockId" VARCHAR(20),
  "round" BIGINT
);

CREATE INDEX IF NOT EXISTS "mem_round_address" ON "mem_round"("address");
CREATE INDEX IF NOT EXISTS "mem_round_round" ON "mem_round"("round");

CREATE TABLE IF NOT EXISTS "mem_accounts2delegates"(
  "accountId" VARCHAR(22) NOT NULL,
  "dependentId" VARCHAR(64) NOT NULL,
  FOREIGN KEY ("accountId") REFERENCES mem_accounts("address") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "mem_accounts2delegates_accountId" ON "mem_accounts2delegates"("accountId");

CREATE TABLE IF NOT EXISTS "mem_accounts2u_delegates"(
  "accountId" VARCHAR(22) NOT NULL,
  "dependentId" VARCHAR(64) NOT NULL,
  FOREIGN KEY ("accountId") REFERENCES mem_accounts("address") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "mem_accounts2u_delegates_accountId" ON "mem_accounts2u_delegates"("accountId");



CREATE TABLE IF NOT EXISTS "mem_accounts2rankings"(
  "accountId" VARCHAR(22) NOT NULL,
  "dependentId" VARCHAR(64) NOT NULL,
  FOREIGN KEY ("accountId") REFERENCES mem_accounts("address") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "mem_accounts2rankings_accountId" ON "mem_accounts2rankings"("accountId");

CREATE TABLE IF NOT EXISTS "mem_accounts2u_rankings"(
  "accountId" VARCHAR(22) NOT NULL,
  "dependentId" VARCHAR(64) NOT NULL,
  FOREIGN KEY ("accountId") REFERENCES mem_accounts("address") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "mem_accounts2u_rankings_accountId" ON "mem_accounts2u_rankings"("accountId");



CREATE TABLE IF NOT EXISTS "mem_accounts2multisignatures"(
  "accountId" VARCHAR(22) NOT NULL,
  "dependentId" VARCHAR(64) NOT NULL,
  FOREIGN KEY ("accountId") REFERENCES mem_accounts("address") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "mem_accounts2multisignatures_accountId" ON "mem_accounts2multisignatures"("accountId");

CREATE TABLE IF NOT EXISTS "mem_accounts2u_multisignatures"(
  "accountId" VARCHAR(22) NOT NULL,
  "dependentId" VARCHAR(64) NOT NULL,
  FOREIGN KEY ("accountId") REFERENCES mem_accounts("address") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "mem_accounts2u_multisignatures_accountId" ON "mem_accounts2u_multisignatures"("accountId");


CREATE TABLE IF NOT EXISTS "mem_accounts2ac_status"(
  "accountId" VARCHAR(22) NOT NULL,
  "dependentId" VARCHAR(64) NOT NULL,
  FOREIGN KEY ("accountId") REFERENCES mem_accounts("address") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "mem_accounts2ac_status_accountId" ON "mem_accounts2ac_status"("accountId");

CREATE TABLE IF NOT EXISTS "mem_accounts2u_ac_status"(
  "accountId" VARCHAR(22) NOT NULL,
  "dependentId" VARCHAR(64) NOT NULL,
  FOREIGN KEY ("accountId") REFERENCES mem_accounts("address") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "mem_accounts2u_ac_status_accountId" ON "mem_accounts2u_ac_status"("accountId");



DELETE FROM "mem_accounts2u_delegates";
DELETE FROM "mem_accounts2u_rankings";
DELETE FROM "mem_accounts2u_multisignatures";
DELETE FROM "mem_accounts2u_ac_status";

INSERT INTO "mem_accounts2u_ac_status" SELECT * FROM "mem_accounts2ac_status";
INSERT INTO "mem_accounts2u_delegates" SELECT * FROM "mem_accounts2delegates";
INSERT INTO "mem_accounts2u_rankings" SELECT * FROM "mem_accounts2rankings";
INSERT INTO "mem_accounts2u_multisignatures" SELECT * FROM "mem_accounts2multisignatures";

COMMIT;
