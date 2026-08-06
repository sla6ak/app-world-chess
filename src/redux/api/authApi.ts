import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '@config/testURL';

export const authApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }: any) => {
      const token = getState().token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['user', 'topPlayers'],
  endpoints: (builder) => ({
    registrationUser: builder.mutation({
      query: (newUser) => ({
        url: '/auth/signup',
        method: 'POST',
        body: newUser,
      }),
      invalidatesTags: ['user'],
    }),
    loginUser: builder.mutation({
      query: (userData) => ({
        url: `/auth/login`,
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['user'],
    }),
    emailVerify: builder.mutation({
      query: (verificationToken) => ({
        url: `/auth/login/${verificationToken}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['user'],
    }),
    /** Топ игроков по текущему рейтингу (default 30 на бэке). */
    getTopPlayers: builder.query({
      query: (limit: number = 30) => ({
        url: `/auth/top?limit=${limit}`,
        method: 'GET',
      }),
      providesTags: ['topPlayers'],
    }),
    unLoginUser: builder.mutation({
      query: () => ({
        url: `/auth/logout`,
        method: 'POST',
      }),
      invalidatesTags: ['user'],
    }),
    isActivToken: builder.query({
      query: () => ({
        url: `/auth/current`,
        method: 'GET',
      }),
      providesTags: ['user'],
    }),
    createSearchRoom: builder.mutation({
      query: (gameData) => ({
        url: `/game/find`,
        method: 'POST',
        body: gameData,
      }),
      invalidatesTags: ['user'],
    }),
    cancelSearchRoom: builder.mutation({
      query: (gameData) => ({
        url: `/game/cancel`,
        method: 'POST',
        body: gameData,
      }),
      invalidatesTags: ['user'],
    }),
    getActiveGame: builder.query({
      query: () => ({
        url: `/game/active`,
        method: 'GET',
      }),
      providesTags: ['user'],
    }),
    /** История завершённых партий текущего игрока (100 по умолчанию, без pending). */
    getGameHistory: builder.query({
      query: (limit: number = 100) => ({
        url: `/game/history/last?limit=${limit}`,
        method: 'GET',
      }),
      providesTags: ['user'],
    }),
  }),
});

export const {
  useIsActivTokenQuery,
  useEmailVerifyMutation,
  useRegistrationUserMutation,
  useLoginUserMutation,
  useUnLoginUserMutation,
  useCreateSearchRoomMutation,
  useCancelSearchRoomMutation,
  useGetActiveGameQuery,
  useGetTopPlayersQuery,
  useGetGameHistoryQuery,
} = authApi;

export default authApi;
