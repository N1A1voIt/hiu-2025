import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';

export interface ChatPart {
  text: string;
}

export interface ChatContent {
  parts: ChatPart[];
  role: string;
}

export interface ChatAction {
  state_delta: Record<string, any>;
  artifact_delta: Record<string, any>;
  requested_auth_configs: Record<string, any>;
}

export interface ChatMessage {
  content: ChatContent;
  invocation_id: string;
  author: string;
  actions: ChatAction;
  id: string;
  timestamp: number;
}

export interface ChatResponse {
  candidates: Candidate[];
  model_version: string;
  usage_metadata: UsageMetadata;
  automatic_function_calling_history: any[]; // Can be typed more precisely if needed
}

export interface Candidate {
  content: Content;
  finish_reason: string;
  avg_logprobs: number;
}

export interface Content {
  parts: Part[];
  role: string;
}

export interface Part {
  text: string;
}

export interface UsageMetadata {
  candidates_token_count: number;
  candidates_tokens_details: TokenDetail[];
  prompt_token_count: number;
  prompt_tokens_details: TokenDetail[];
  total_token_count: number;
}

export interface TokenDetail {
  modality: string;
  token_count: number;
}



@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private readonly apiUrl =  "http://0.0.0.0:8000";
  constructor(
    private http: HttpClient,
  ) { }

  sendMessage(text: string): Observable<ChatMessage[]> {
    const body = {
      app_name: "unifamAgent",
      user_id: "u_123",
      session_id: "s_123",
      new_message: {
        role: "user",
        parts: [
          { text: text }
        ]
      }
    };

    // Create HttpHeaders and set the Origin header
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.post<ChatMessage[]>('/api/run', body, httpOptions);
  }

  sendMessageWithFile(text: string, file: File): Observable<ChatMessage[]> {
    return new Observable<ChatMessage[]>(observer => {
      const reader = new FileReader();

      reader.onload = () => {
        const base64Data = (reader.result as string).split(',')[1]; // remove "data:image/png;base64,"
        let prompt = "ampianaro aho, "+ text;
        const body = {
          app_name: "unifamAgent",
          user_id: "u_123",
          session_id: "s_123",
          new_message: {
            role: "user",
            parts: [
              {text: prompt},
              {
                inline_data: {
                  mime_type: "application/pdf",
                  data: `${base64Data}`
                }
              }
            ]
          }
        };

        const headers = new HttpHeaders({
          'Content-Type': 'application/json'
        });

        return this.http.post<ChatMessage[]>('/api/run', body, { headers }).subscribe({
          next: (res) => observer.next(res),
          error: (err) => observer.error(err),
          complete: () => observer.complete()
        });
      };

      reader.onerror = (err) => observer.error(err);
      reader.readAsDataURL(file); // ⬅️ reads the file and triggers the onload with base64
    });
  }

  sendMessageWithFileDep(text: string, file: File): Observable<ChatMessage[]> {
    return new Observable<ChatMessage[]>(observer => {
      const reader = new FileReader();

      reader.onload = () => {
        const base64Data = (reader.result as string).split(',')[1]; // remove "data:image/png;base64,"
        let prompt = text;
        const body = {
          app_name: "unifamAgent",
          user_id: "u_123",
          session_id: "s_123",
          new_message: {
            role: "user",
            parts: [
              {text: prompt},
              {
                inline_data: {
                  mime_type: "image/png",
                  data: `${base64Data}`
                }
              }
            ]
          }
        };

        const headers = new HttpHeaders({
          'Content-Type': 'application/json'
        });

        return this.http.post<ChatMessage[]>('/api/run', body, { headers }).subscribe({
          next: (res) => observer.next(res),
          error: (err) => observer.error(err),
          complete: () => observer.complete()
        });
      };

      reader.onerror = (err) => observer.error(err);
      reader.readAsDataURL(file); // ⬅️ reads the file and triggers the onload with base64
    });
  }
  /*sendMessageWithFileDep(text: string, file: File): Observable<ChatResponse[]> {
    return new Observable<ChatResponse[]>(observer => {
      const reader = new FileReader();

      reader.onload = () => {
        const base64Data = (reader.result as string).split(',')[1]; // remove "data:image/png;base64,"

        const body = {
          app_name: "unifamAgent",
          user_id: "u_123",
          session_id: "s_123",
          new_message: {
            role: "user",
            parts: [
              { text: text },
              {
                inline_data: {
                  mime_type: "image/png",
                  data: base64Data
                }
              }
            ]
          }
        };

        const headers = new HttpHeaders({
          'Content-Type': 'application/json'
        });

        this.http.post<ChatResponse[]>('/api/run_sse', body, { headers }).subscribe({
          next: (res) => observer.next(res),
          error: (err) => observer.error(err),
          complete: () => observer.complete()
        });

        return new Observable(observer => {
          this.http.post<ChatResponse[]>('/api/run_sse', body, { headers }).subscribe({
            next: (res) => {
              try {
                const rawText = res[0].candidates[0].content?.parts[0]?.text || '';
                const cleanText = rawText.replace(/```json|```/g, '').trim();
                const parsedObject = JSON.parse(cleanText);
                observer.next(parsedObject); // ✅ Return only the parsed JSON
              } catch (e) {
                observer.error("Failed to parse response JSON: " + e);
              }
            },
            error: (err) => observer.error(err),
            complete: () => observer.complete()
          });
        });
      };

      reader.onerror = (err) => observer.error(err);

      reader.readAsDataURL(file); // Convert File to base64
    });
  }*/
}
