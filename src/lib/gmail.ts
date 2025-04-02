import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export interface EmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  historyId: string;
  internalDate: string;
  payload: {
    partId?: string;
    mimeType: string;
    filename?: string;
    headers: {
      name: string;
      value: string;
    }[];
    body?: {
      size: number;
      data?: string;
    };
    parts?: any[];
  };
  sizeEstimate: number;
  raw?: string;
  // Parsed fields for easier display
  from: string;
  to: string;
  subject: string;
  date: Date;
  body: string;
}

// Helper function to decode base64 URLs
function decodeBase64Url(data: string) {
  try {
    return Buffer.from(
      data.replace(/-/g, "+").replace(/_/g, "/"),
      "base64"
    ).toString();
  } catch (error) {
    console.error("Error decoding base64 data:", error);
    return "";
  }
}

// Helper function to find a header by name
function findHeader(headers: any[], name: string): string {
  const header = headers.find(
    (h) => h.name.toLowerCase() === name.toLowerCase()
  );
  return header ? header.value : "";
}

// Helper function to parse email body (handles multipart and text emails)
function parseEmailBody(payload: any): string {
  if (!payload) return "";

  // For simple emails with just a body
  if (payload.body && payload.body.data) {
    return decodeBase64Url(payload.body.data);
  }

  // For multipart emails, try to find text/plain or text/html part
  if (payload.parts) {
    // First look for text/plain
    const plainPart = payload.parts.find(
      (part: any) => part.mimeType === "text/plain"
    );
    if (plainPart && plainPart.body && plainPart.body.data) {
      return decodeBase64Url(plainPart.body.data);
    }

    // If no text/plain, look for text/html
    const htmlPart = payload.parts.find(
      (part: any) => part.mimeType === "text/html"
    );
    if (htmlPart && htmlPart.body && htmlPart.body.data) {
      return decodeBase64Url(htmlPart.body.data);
    }

    // Recursively check nested parts
    for (const part of payload.parts) {
      if (part.parts) {
        const nestedBody = parseEmailBody(part);
        if (nestedBody) return nestedBody;
      }
    }
  }

  return "";
}

// Fetch emails from Gmail API
export async function fetchEmails(
  accessToken: string,
  maxResults: number = 10
): Promise<EmailMessage[]> {
  try {
    console.log("Starting Gmail API request with token");

    if (!accessToken) {
      console.error("No access token provided to fetchEmails");
      throw new Error("Missing access token for Gmail API");
    }

    // First, get the list of message IDs
    const listResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );

    if (!listResponse.ok) {
      // Log detailed error information
      let errorText;
      try {
        errorText = await listResponse.text();
        console.error("Gmail API error response:", {
          status: listResponse.status,
          statusText: listResponse.statusText,
          body: errorText,
        });
      } catch (e) {
        console.error("Could not read error response", e);
        errorText = `Status: ${listResponse.status}, StatusText: ${listResponse.statusText}`;
      }

      // Handle specific error codes
      if (listResponse.status === 401) {
        throw new Error(
          "Unauthorized: Your Google access token has expired or is invalid"
        );
      } else if (listResponse.status === 403) {
        throw new Error("Forbidden: Gmail access permission required");
      } else {
        throw new Error(
          `Failed to fetch email list: ${listResponse.statusText}. Status: ${listResponse.status}`
        );
      }
    }

    let listData;
    try {
      listData = await listResponse.json();
    } catch (error) {
      console.error("Error parsing Gmail API response:", error);
      throw new Error("Failed to parse Gmail API response");
    }

    console.log(
      `Successfully retrieved ${listData.messages?.length || 0} email IDs`
    );

    const messageIds = listData.messages || [];
    if (messageIds.length === 0) {
      console.log("No emails found in Gmail account");
      return [];
    }

    // Then fetch the full details of each message
    const emails = await Promise.all(
      messageIds.map(async (message: { id: string }) => {
        console.log(`Fetching details for message ID: ${message.id}`);

        const messageResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}?format=full`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
            },
          }
        );

        if (!messageResponse.ok) {
          console.error(`Error fetching message ${message.id}:`, {
            status: messageResponse.status,
            statusText: messageResponse.statusText,
          });

          throw new Error(
            `Failed to fetch message ${message.id}: ${messageResponse.statusText}`
          );
        }

        let messageData;
        try {
          messageData = await messageResponse.json();
        } catch (error) {
          console.error(`Error parsing message ${message.id}:`, error);
          throw new Error(`Failed to parse message ${message.id}`);
        }

        // Parse headers for common fields
        const headers = messageData.payload.headers;
        const subject = findHeader(headers, "subject");
        const from = findHeader(headers, "from");
        const to = findHeader(headers, "to");
        const date = new Date(findHeader(headers, "date"));

        // Parse body content
        const body = parseEmailBody(messageData.payload);

        return {
          ...messageData,
          subject,
          from,
          to,
          date,
          body,
        };
      })
    );

    console.log(`Successfully processed ${emails.length} emails`);
    return emails;
  } catch (error) {
    console.error("Error fetching emails:", error);
    throw error;
  }
}
