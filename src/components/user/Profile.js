import React from "react";

import { ShowArticles } from "../article/ShowArticles";
import { ShowTab } from "../filters/ShowTab";
import auth from "../../utils/auth";
import customFetch from "../../utils/customFetch";
import { Pagination } from "../filters/Pagination";

export default class Profile extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			profile: {},
			articles: [],
			articlesCount: 0,
			page: 1,
			isLoading: false,
			initailTab: "myFeed"
		};
	}

	componentDidMount() {
		
		const username =
			this.props.location.state && this.props.location.state.username;
		const profileAPI = `https://conduit.productionready.io/api/profiles/${username}`;
		fetch(profileAPI)
			.then(res => res.json())
			.then(data => {
				let newProfile = data.profile;
				this.setState({ profile: newProfile });
			})
			.catch(error => console.error(error));

		const	author = this.props.location.state && this.props.location.state.username;


		this.fetchArticles({author});
	}

	fetchArticles = (filter = {}) => {
		let { author, favorited, offset } = filter;
		const URL = `https://conduit.productionready.io/api/articles?limit=10&offset=${offset ||
			"0"}&author=${author || ""}&favorited=${favorited || ""}`;

		fetch(URL)
			.then(res => res.json())
			.then(data => {
				const { articles, articlesCount } = data;
				this.setState({ articles, articlesCount, isLoading: false });
			})
			.catch(error => console.error(error));
	};

	editProfile = () => {
		this.props.history.push("/editUser");
	};

	handleTab = tab => {
		this.setState({ initailTab: tab });
		const {
			profile: { username }
		} = this.state;
		switch (tab) {
			case "myFeed":
				this.fetchArticles({ author: username });
				break;
			case "favorites":
				console.log("fava");
				
				this.fetchArticles({ favorited: username });
				break;
			default:
				break;
		}
	};

	setPage = page => {
		this.setState({ page });
	};

	render() {
		const {
			articles,
			isLoading,
			profile,
			articlesCount,
			page,
			initailTab
		} = this.state;
		const userData = JSON.parse(localStorage.getItem("userData"));
		const currentUser =
			(userData && userData.user && userData.user.username) || "";

		return (
			<React.Fragment>
				<section className="hero is-small is-light is-bold">
					<div className="base column is-8 is-offset-2">
						<div className="hero-body">
							<div className="container hero-container">
								<div>
									<figure className="image is-128x128 img-container">
										<img
											className=" is-responsive image is-rounded"
											src={
												profile.image ||
												"https://bulma.io/images/placeholders/128x128.png"
											}
											alt="profile avatar"
										/>
									</figure>
									<h4 className="title is-4">{profile.username}</h4>
									<p className="profile-bio is-6">{profile.bio}</p>
								</div>
							</div>
						</div>
						<div className="hero-bottom">
							{currentUser === profile.username ? (
								<button
									className="profile-btn button is-outlined"
									onClick={this.editProfile}
								>
									<span className="icon">
										<i className="fas fa-cog" />
									</span>
									<span>Edit Profile Settings</span>
								</button>
							) : (
								<FollowButton profile={profile} />
							)}
						</div>
					</div>
				</section>

				<div className="base column is-8 is-offset-2">
					<ShowTab
						initailTab={initailTab}
						profile="profile"
						changeTab={this.handleTab}
					/>
					<ShowArticles articles={articles} isLoading={isLoading} />
					<Pagination
						count={articlesCount}
						filterByPage={this.fetchArticles}
						setPage={this.setPage}
						page={page}
					/>
				</div>
			</React.Fragment>
		);
	}
}

class FollowButton extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			following: props.profile.following
		};
	}

	handleClick = () => {
		const username = this.props.profile && this.props.profile.username;
		const url = `https://conduit.productionready.io/api/profiles/${username}/follow`;
		const method = this.state.following ? "DELETE" : "POST";
		const token = `Token ${auth.getToken()}`;

		customFetch(url, null, token, method)
			.then(data => {
				if (!data.errors) {
					const { following } = data.profile;
					this.setState({ following });
				} else {
					//   this.setState({ message: "email or password is invalid"});
				}
			})
			.catch(error => console.error(error));
	};

	render() {
		const buttonText = this.state.following ? "Unfollow" : "Follow";
		const username = this.props.profile && this.props.profile.username;
		return (
			<button
				className="profile-btn button is-outlined"
				onClick={this.handleClick}
			>
				<span className="icon">
					<i className="fas fa-plus" />
				</span>
				<span>{`${buttonText} ${username}`}</span>
			</button>
		);
	}
}
