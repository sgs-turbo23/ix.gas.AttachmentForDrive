let slack;

function main() {
  slack = new slackNotifier(secret.getSlackId(), 'Save Attachment');
  try {
    const yesterday = datetimeUtil.getYesterday(new Date());
    var mailList = getMessages(yesterday);
    console.log(mailList);
    if (mailList.length > 0) {
      saveAttachment(yesterday, mailList);
    }
  } catch (error) {
    slack.postToSlack(`エラーが発生しました。\n${error}`);
  }
}

function getMessages(date) {
  // 前日のメールを取得
  const query = `has:attachment after:${datetimeUtil.makeDateString(date)}`;
  // メールの構造はthreads > messsages > thread > messageの構造
  const threads = GmailApp.search(query);
  return GmailApp.getMessagesForThreads(threads);
}

function saveAttachment(date, messages) {
  const rootFolder = DriveApp.getFolderById(secret.getDriveDirId());
  const folder = rootFolder.createFolder(datetimeUtil.makeShortDateString(date));
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
  slack.postToSlack(`<@ma.iw>Gmailの添付ファイルをGoogle Driveに保存しました\n${folder.getUrl()}`);
}
