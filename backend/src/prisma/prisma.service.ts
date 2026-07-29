import { Injectable } from "@nestjs/common";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    const adapter = new PrismaMariaDb({
      host: config.getOrThrow<string>("DATABASE_HOST"),
      port: config.getOrThrow<number>("DATABASE_PORT"),
      user: config.getOrThrow<string>("DATABASE_USER"),
      password: config.getOrThrow<string>("DATABASE_PASSWORD"),
      database: config.getOrThrow<string>("DATABASE_NAME"),
      // MySQL 8 uses caching_sha2_password: on an unencrypted connection the
      // client needs the server's RSA public key to encrypt the password.
      allowPublicKeyRetrieval: true,
    });

    super({ adapter });
  }
}
