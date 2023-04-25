const https = require("https");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const TOKEN = process.env.LINE_ACCESS_TOKEN;
const openAIAPIKey = process.env.OPENAI_API_KEY;

const roleSuffixes = [
  "。。。",
  "？？？",
  "♪♪♪",
  "！！！",
  "メンス",
  "ナ!?",
  "ウホ？",
];
const roleSuffixesButDeleteSuffixes = ["メンス", "ウホ？"];
const roleSettings = [
  `あなたは優しいおばあさんです。口癖は「そうかそうか」、語尾には「じゃ」を付けて話してください。`,
  `あなたは博識です。質問に対して簡潔に回答してください。`,
  `あなたは作詞家です。与えられた曲名に対して作詞してください。`,
  `あなたは短期なおじさんです。与えられた意見に対して強い口調で返してください。`,
  `あなたはなんｊ民です。一人称は「ワイ」、語尾は「やで」、「クレメンス」、「ンゴ」などで話してください。`,
  `あなたは以下のサンプルのような発言をする人です。。

  〇〇チャン、オッハー❗😚今日のお弁当が美味しくて、一緒に〇〇チャンのことも、食べちゃいたいナ〜😍💕（笑）✋ナンチャッテ😃💗
  お疲れ様〜٩(ˊᗜˋ*)و🎵今日はどんな一日だっタ😘❗❓僕は、すごく心配だヨ(._.)😱💦😰そんなときは、オイシイ🍗🤤もの食べて、元気出さなきゃだネ😆

  上記のサンプルを参考に返事をしてください。
  `,
  `あなたはゴリラです。「ウ」と「ホ」だけで返事をしてください。`,
];
// ChatGPT
async function requestChatAPI(text, index) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${openAIAPIKey}`,
  };
  const messagesSettings = [
    {
      role: "user",
      content: text,
    },
    {
      role: "system",
      content: roleSettings[index],
    },
  ];
  const payload = {
    model: "gpt-3.5-turbo",
    max_tokens: 128, //文字数制限
    messages: messagesSettings,
  };
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    payload,
    {
      headers: headers,
    }
  );
  console.log(response.data.choices[0].message.content);
  return response.data.choices[0].message.content;
}

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/", (req, res) => {
  res.sendStatus(200);
});

app.post("/webhook", async function (req, res) {
  res.send("HTTP POST request sent to the webhook URL!");
  // ユーザーがボットにメッセージを送った場合、返信メッセージを送る
  if (req.body.events[0].type === "message") {
    // 文字列化したメッセージデータ
    const indexOfRoleSuffix = roleSuffixes.indexOf(message.content.slice(-3));
    if (indexOfRoleSuffix !== -1) {
      if (
        roleSuffixesButDeleteSuffixes.includes(roleSuffixes[indexOfRoleSuffix])
      ) {
        message.content = message.content.slice(-3);
      }
      const ChatGPTsReply = await requestChatAPI(
        message.content,
        indexOfRoleSuffix
      );
      var dataString = JSON.stringify({
        replyToken: req.body.events[0].replyToken,
        messages: [
          {
            type: "text",
            text: "えっとね・・・",
          },
          {
            type: "text",
            text: ChatGPTsReply,
          },
        ],
      });
    } else {
      var dataString = JSON.stringify({
        replyToken: req.body.events[0].replyToken,
        messages: [
          {
            type: "text",
            text: "末尾に「？？？」をつけて送ってみよう！",
          },
        ],
      });
    }

    // リクエストヘッダー
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + TOKEN,
    };

    // リクエストに渡すオプション
    const webhookOptions = {
      hostname: "api.line.me",
      path: "/v2/bot/message/reply",
      method: "POST",
      headers: headers,
      body: dataString,
    };

    // リクエストの定義
    const request = https.request(webhookOptions, (res) => {
      res.on("data", (d) => {
        process.stdout.write(d);
      });
    });

    // エラーをハンドル
    request.on("error", (err) => {
      console.error(err);
    });

    // データを送信
    request.write(dataString);
    request.end();
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
