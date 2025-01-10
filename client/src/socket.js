import { io } from 'socket.io-client';
import Cookies from 'js-cookie'
export const socket = io('http://localhost:3000', {
    autoConnect: false,
    auth:{
        token: Cookies.get("jwt")
    }
});