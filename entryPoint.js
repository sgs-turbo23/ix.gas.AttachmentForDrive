const FOLDER_ID = '<>';

function main() {
  try {
    const yesterday = getYesterday(new Date());
    var mailList = getMessages(yesterday);
    console.log(mailList);
    if (mailList.length > 0) {
      saveAttachment(yesterday, mailList);
    }
  } catch (error) {
    postToSlack(`エラーが発生しました。\n${error}`);
  }
}

function getYesterday(date) {
  date.setDate(date.getDate() - 1);
  return date;
}

function makeDateString(date) {
  validTypeDate(date); 

  // yyyy/M/d
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

function makeShortDateString(date) {
  validTypeDate(date);

  // yyyyMMdd
  return `${date.getFullYear()}${PadLeftZero(date.getMonth() + 1)}${PadLeftZero(date.getDate())}`;
}

function validTypeDate(date) {
  // Date型の判定
  var toString = Object.prototype.toString
  const typeName = '[object Date]';
  if (toString.call(new Date()) !== typeName) {
    throw new TypeError(`${date} is not a date`);
  }
  return;
}

function PadLeftZero(arg) {
  if (arg.length > 2) {
    throw new RangeError(`arg over 2 lengch arg:${arg}`);
  }
  return ("0" + arg).slice(-2);
}

function getMessages(date) {
  // 前日のメールを取得
  const query = `has:attachment after:${makeDateString(date)}`;
  // メールの構造はthreads > messsages > thread > messageの構造
  const threads = GmailApp.search(query);
  return GmailApp.getMessagesForThreads(threads);
}

function saveAttachment(date, messages) {
  const rootFolder = DriveApp.getFolderById(FOLDER_ID);
  const folder = rootFolder.createFolder(makeShortDateString(date));
  for(const thread of messages){
    for(const message of thread){
      // Attachment（添付ファイルを取得）
      const attachments = message.getAttachments();
      // 添付ファイルが存在する場合、全てを取得
      for(const attachment of attachments){
        folder.createFile(attachment);
      }
    }
  }
  postToSlack(`<@ma.iw>Gmailの添付ファイルをGoogle Driveに保存しました\n${folder.getUrl()}`);
}

var postUrl = '<>';
var username = 'Save Attachment';  // 通知時に表示されるユーザー名

function postToSlack(message) {
  var jsonData =
  {
     "username" : username,
     "text" : message
  };
  var payload = JSON.stringify(jsonData);

  var options =
  {
    "method" : "post",
    "contentType" : "application/json",
    "payload" : payload
  };

  UrlFetchApp.fetch(postUrl, options);
}
