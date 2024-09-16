import express from 'express';
import 'dotenv/config';
import cors from "cors"
import { createMessage, deleteMessage, updateMessage } from './controllers/message.controller';
import { createDirectMessage, deleteDirectMessage, updateDirectMessage } from './controllers/direct-message.controller';

const app = express();
app.use(cors());
app.use(express.json());


app.route('/message').post(createMessage);
app.route("/message/:id")
  .delete(deleteMessage)
  .put(updateMessage)

app.route("/direct-message").post(createDirectMessage)
app.route("/direct-message/:id")
  .delete(deleteDirectMessage)
  .put(updateDirectMessage)

 


app.listen(8000, () => {
  console.log('Message Service running on port 8000');
});
