import { Schema, model } from "mongoose";

const ValidatorSchema = new Schema({
  telegramId: String,
  name: String,
});

export default model("Validator", ValidatorSchema);
