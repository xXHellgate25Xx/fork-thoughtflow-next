import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQuery } from '../supabase/baseQuery';

interface AuthSuccessResponse {
  data: {
    user: {
      id: string;
      aud: string;
      role: string;
      email: string;
      email_confirmed_at: string;
      phone: string;
      confirmed_at: string;
      last_sign_in_at: string;
      app_metadata: {
        provider: string;
        providers: string[];
      };
      user_metadata: Record<string, unknown>;
      identities: {
        identity_id: string;
        id: string;
        user_id: string;
        identity_data: {
          email: string;
          email_verified: boolean;
          phone_verified: boolean;
          sub: string;
        };
        provider: string;
        last_sign_in_at: string;
        created_at: string;
        updated_at: string;
        email: string;
      }[];
      created_at: string;
      updated_at: string;
      is_anonymous: boolean;
    } | null;
    session: {
      access_token: string;
      token_type: string;
      expires_in: number;
      expires_at: number;
      refresh_token: string;
      user: {
        id: string;
        aud: string;
        role: string;
        email: string;
        email_confirmed_at: string;
        phone: string;
        confirmed_at: string;
        last_sign_in_at: string;
        app_metadata: {
          provider: string;
          providers: string[];
        };
        user_metadata: Record<string, unknown>;
        identities: {
          identity_id: string;
          id: string;
          user_id: string;
          identity_data: {
            email: string;
            email_verified: boolean;
            phone_verified: boolean;
            sub: string;
          };
          provider: string;
          last_sign_in_at: string;
          created_at: string;
          updated_at: string;
          email: string;
        }[];
        created_at: string;
        updated_at: string;
        is_anonymous: boolean;
      };
    } | null;
  };
  error: null;
}

interface AuthErrorResponse {
  data: {
    user: null;
    session: null;
  };
  error: {
    __isAuthError: boolean;
    name: string;
    status: number;
    code: string;
  };
}

type AuthResponse = AuthSuccessResponse | AuthErrorResponse;

// Define types for each API request and response
interface SignUpRequest {
  email: string;
  password: string;
  displayName: string
}

interface SignInRequest {
  email: string;
  password: string;
}

interface SendOtpRequest {
  email: string;
}

interface VerifyOtpRequest {
  email: string;
  otp: string;
}

interface RequestResetPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  accessToken: string;
  refreshToken: string;
  password: string;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery, // Use your custom baseQuery
  endpoints: (builder) => ({
    signUpWithEmailAndPassword: builder.mutation<AuthResponse, SignUpRequest>({
      query: ({ email, password, displayName }) => ({
        url: 'functions/v1/api/auth/signUpWithPassword',
        method: 'POST',
        body: {
          email,
          password,
          displayName
        },
      }),
    }),
    signInWithEmailAndPassword: builder.mutation<AuthResponse, SignInRequest>({
      query: ({ email, password }) => ({
        url: 'functions/v1/api/auth/signInWithPassword',
        method: 'POST',
        body: {
          email,
          password,
        },
      }),
    }),
    sendOtp: builder.mutation<void, SendOtpRequest>({
      query: ({ email }) => ({
        url: 'functions/v1/api/auth/signInWithOtp',
        method: 'POST',
        body: {
          email,
        },
      }),
    }),
    verifyOtp: builder.mutation<AuthResponse, VerifyOtpRequest>({
      query: ({ email, otp }) => ({
        url: 'functions/v1/api/auth/verifyOtp',
        method: 'POST',
        body: {
          email,
          otp,
        },
      }),
    }),
    requestResetPassword: builder.mutation<void, RequestResetPasswordRequest>({
      query: ({ email }) => ({
        url: 'functions/v1/api/auth/requestResetPassword',
        method: 'POST',
        body: { email },
      }),
    }),
    resetPassword: builder.mutation<AuthResponse, ResetPasswordRequest>({
      query: ({ accessToken, refreshToken, password }) => ({
        url: 'functions/v1/api/auth/resetPassword',
        method: 'POST',
        body: { 
          accessToken,
          refreshToken,
          password,
        }, 
      }),
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useSignUpWithEmailAndPasswordMutation,
  useSignInWithEmailAndPasswordMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useRequestResetPasswordMutation,
  useResetPasswordMutation,
} = authApi;
