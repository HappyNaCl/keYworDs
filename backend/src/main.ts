import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: "http://localhost:5173",
    credentials: true,
  });
  app.setGlobalPrefix("api");

  const config = new DocumentBuilder()
    .setTitle("keYworDs API")
    .setDescription("Daily word guessing game")
    .setVersion("1.0")
    .addCookieAuth("gameSessionId", {
      type: "apiKey",
      in: "cookie",
      name: "gameSessionId",
      description: "Session cookie issued by POST /api/games",
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document, {
    swaggerOptions: { withCredentials: true, persistAuthorization: true },
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
