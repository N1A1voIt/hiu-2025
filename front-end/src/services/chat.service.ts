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
  sendMessageWithFile(text: string,file:string): Observable<ChatMessage[]> {
    const body = {
      app_name: "unifamAgent",
      user_id: "u_123",
      session_id: "s_123",
      new_message: {
        role: "user",
        parts: [
          { text: text },
          {
            inline_data : {
              mimeType: "image/png",
              data: file
            }
          }
        ]
      }
    };

    // Create HttpHeaders and set the Origin header
    const headers = new HttpHeaders({
      'Content-Type': 'application/json', // Dynamically get the origin of your Angular app
      // You could also hardcode the origin if it's always the same
      // 'Origin': 'http://localhost:4200'
    });

    // Include the headers in the POST request options
    const options = { headers: headers };

    return this.http.post<ChatMessage[]>('/api/run', body, options);
  }
}
