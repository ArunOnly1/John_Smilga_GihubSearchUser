import React, { useState, useEffect, createContext } from 'react'
import mockUser from './mockData.js/mockUser'
import mockRepos from './mockData.js/mockRepos'
import mockFollowers from './mockData.js/mockFollowers'
import { $axios } from '../lib/axios'

const GithubContext = createContext()

// Provider,Consumer

const GithubProvider = ({ children }) => {
	const [githubUser, setGithubUser] = useState(mockUser)
	const [repos, setRepos] = useState(mockRepos)
	const [followers, setFollowers] = useState(mockFollowers)

	// request loading
	const [requests, setRequests] = useState(0)
	const [isLoading, setIsLoading] = useState(false)

	// error
	const [error, setError] = useState({ show: false, msg: '' })
	const searchGithubUser = async (user) => {
		// toggleError
		// setLoading(true)
		toggleError()
		setIsLoading(true)
		try {
			const response = await $axios.get(`/users/${user}`)
			if (response) {
				setGithubUser(response.data)
				const { login, followers_url } = response.data
				// repos
				// (https://api.github.com/users/john-smilga/repos?per_page=100)
				// followers
				// (https://api.github.com/users/john-smilga/followers)
				try {
					const repos = await $axios.get(`/users/${login}/repos?per_page=100`)
					setRepos(repos.data)
					const followers = await $axios.get(`${followers_url}?per_page=100`)
					setFollowers(followers.data)
				} catch (error) {
					console.log(error)
				}
			} else {
				toggleError(true, 'there is no user with that username')
			}
		} catch (error) {
			console.log(error)
		} finally {
			checkRequests()
			setIsLoading(false)
		}
	}
	// check rate
	const checkRequests = async () => {
		try {
			const { data } = await $axios.get('/rate_limit')
			let {
				rate: { remaining },
			} = data

			setRequests(remaining)
			if (remaining === 0) {
				// throw an error
				toggleError(true, 'sorry, you have exceeded your hourly rate limit!')
			}
		} catch (error) {
			console.log(error)
		}
	}

	function toggleError(show = 'false', msg = '') {
		setError({
			show,
			msg,
		})
	}
	// error
	useEffect(checkRequests, [])
	return (
		<GithubContext.Provider
			value={{
				githubUser,
				repos,
				followers,
				requests,
				error,
				searchGithubUser,
				isLoading,
			}}
		>
			{children}
		</GithubContext.Provider>
	)
}

export { GithubProvider, GithubContext }
