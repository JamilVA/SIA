import { createSlice } from '@reduxjs/toolkit';

export const userSlice = createSlice({
    name: "user",
    initialState: {
        id:0
    },
    reducers: {
        updateInfoUser: (state, action) => {
            state.id = action.payload;
        }
    }
})

export default userSlice.reducer
export const { updateInfoUser } = userSlice.actions