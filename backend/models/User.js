import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		// auth0Id: {
		// 	type: String,
		// 	required: true,
		// 	unique: true,
		// },
		email: {
			type: String,
			required: true,
			unique: true,
		},
		name: {
			type: String,
			required: true,
		},
		picture: {
			type: String,
		},
		nickname: {
			type: String,
		},
		gitHub: {
			type: String,
			default: "",
		},
		leetCode: {
			type: String,
			default: "",
		},
	},
	{ timestamps: true },
);

export default mongoose.model("User", userSchema);
