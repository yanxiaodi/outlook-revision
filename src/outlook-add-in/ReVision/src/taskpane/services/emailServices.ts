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

export const isReadMode = () => {
  // The displayReplyForm API is a read mode API, so if this is undefined then you are in compose mode.
  const replyForm = Office.context.mailbox.item?.displayReplyForm;
  return replyForm !== undefined;
};
