import axios from 'axios'

export const $axios = axios.create({
	baseURL: 'https://api.github.com',
	// timeout: 2000,
})
