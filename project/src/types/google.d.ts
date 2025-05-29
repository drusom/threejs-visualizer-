declare namespace gapi {
  namespace client {
    function init(config: {
      clientId: string;
      discoveryDocs?: string[];
      scope?: string;
    }): Promise<void>;
  }

  namespace auth2 {
    interface GoogleAuth {
      signIn(): Promise<GoogleUser>;
      signOut(): Promise<void>;
      isSignedIn: {
        get(): boolean;
        listen(listener: (isSignedIn: boolean) => void): void;
      };
    }

    interface GoogleUser {
      getAuthResponse(): {
        access_token: string;
        id_token: string;
        scope: string;
        expires_in: number;
        first_issued_at: number;
        expires_at: number;
      };
    }

    function getAuthInstance(): GoogleAuth;
  }

  function load(api: string, callback: () => void): void;
}

declare global {
  interface Window {
    gapi: typeof gapi;
  }
} 