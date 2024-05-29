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
          // if (result.value.sourceProperty === "subject") {
          //   const subject = await getEmailSubject();
          //   resolve(subject);
          // } else if (result.value.sourceProperty === "body") {
          //   reject("No text selected.");
          // }
          // If no text is selected, return the email body
          resolve("");
        }
      }
    });
  });
};

export const getReplyText = () => {
  return new Promise((resolve, reject) => {
    Office.context.mailbox.item?.body.getAsync(Office.CoercionType.Html, (result) => {
      if (result.status === Office.AsyncResultStatus.Failed) {
        reject(result.error);
      } else {
        // This is a very simple example and might not work in all cases
        // You might need to adjust the logic to correctly identify the start of the original email
        const fullEmail = result.value;
        // Split the HTML string into an array, using the distinct line as the separator
        // The separator is a line that is present in all emails and is not part of the reply: <div><div style=\'border:none;border-top:solid #E1E1E1 1.0pt;padding:3.0pt 0cm 0cm 0cm\'>
        let splitEmail = fullEmail.split("<div><div style='border:none;border-top:solid");

        // The reply should be the first item in the array
        let replyHtml = splitEmail[0];

        // Create a new DOM parser
        let parser = new DOMParser();

        // Parse the reply HTML string into a document
        let doc = parser.parseFromString(replyHtml, "text/html");

        // Extract the text from the document
        //let replyText = doc.body.textContent;

        let replyText = traverseHtml(doc.body);

        // Remove multiple consecutive line breaks
        replyText = replyText
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line)
          .join("\n");

        // Return the reply text
        resolve(replyText);
      }
    });
  });
};

const traverseHtml = (node: Node) => {
  let text = "";

  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      text += (child as Text).textContent;
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const element = child as HTMLElement;
      if (element.tagName === "BR") {
        text += "\n";
      } else if (element.tagName === "DIV" || element.tagName === "P") {
        text += "\n" + traverseHtml(element) + "\n";
      } else {
        text += traverseHtml(element);
      }
    }
  });

  return text;
};
