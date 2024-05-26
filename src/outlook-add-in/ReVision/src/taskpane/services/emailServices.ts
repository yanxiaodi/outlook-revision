export enum EmailMode {
  // AppointmentRead = "AppointmentRead",
  // AppointmentCompose = "AppointmentCompose",
  MessageRead = "MessageRead",
  MessageCompose = "MessageCompose",
  Unknown = "Unknown",
}

export const getCurrentMode = (): EmailMode => {
  const item = Office.context.mailbox.item;
  if (!item) {
    return EmailMode.Unknown;
  }
  if (item?.itemType === Office.MailboxEnums.ItemType.Message) {
    //The displayReplyForm API is a read mode API, so if this is undefined then you are in compose mode.
    const replyForm = Office.context.mailbox.item?.displayReplyForm;
    if (replyForm !== undefined) {
      return EmailMode.MessageRead;
    }
    return EmailMode.MessageCompose;
  }
  return EmailMode.Unknown;
};

export const getEmailSubject = () => {
  if (getCurrentMode() === EmailMode.MessageRead) {
    return new Promise((resolve) => {
      resolve(Office.context.mailbox.item?.subject);
    });
  } else if (getCurrentMode() === EmailMode.MessageCompose) {
    return new Promise((resolve, reject) => {
      Office.context.mailbox.item?.subject.getAsync((result) => {
        if (result.status === Office.AsyncResultStatus.Failed) {
          reject(result.error);
        } else {
          resolve(result.value);
        }
      });
    });
  }
  return Office.context.mailbox.item?.subject;
};

export const getEmailText = () => {
  return new Promise((resolve, reject) => {
    Office.context.mailbox.item?.body.getAsync(Office.CoercionType.Text, (result) => {
      if (result.status === Office.AsyncResultStatus.Failed) {
        reject(result.error);
      } else {
        resolve(result.value);
      }
    });
  });
};

export const getEmailId = () => {
  return Office.context.mailbox.item?.itemId;
};

export const insertToComposeSubject = (text: string) => {
  return new Promise((resolve, reject) => {
    Office.context.mailbox.item?.subject.setAsync(text, (result) => {
      if (result.status === Office.AsyncResultStatus.Failed) {
        reject(result.error);
      } else {
        resolve(result.value);
      }
    });
  });
};

export const insertToComposeBody = (text: string) => {
  return new Promise((resolve, reject) => {
    Office.context.mailbox.item?.body.setSelectedDataAsync(text, (result) => {
      if (result.status === Office.AsyncResultStatus.Failed) {
        reject(result.error);
      } else {
        resolve(result.value);
      }
    });
  });
};

export const getSelectedText = () => {
  return new Promise((resolve, reject) => {
    Office.context.mailbox.item?.getSelectedDataAsync(Office.CoercionType.Text, async (result) => {
      if (result.status === Office.AsyncResultStatus.Failed) {
        reject("Error: " + result.error.message);
      } else {
        if (result.value.data !== "") {
          resolve(result.value.data);
        } else {
          if (result.value.sourceProperty === "subject") {
            const subject = await getEmailSubject();
            resolve(subject);
          } else if (result.value.sourceProperty === "body") {
            reject("No text selected.");
          }
        }
      }
    });
  });
};
