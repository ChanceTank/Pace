const { expect } = require("chai");
const request = require("supertest");
const { app } = require("../backend/server");

describe("Checkins API", () => {
	it("should create a new checkin", (done) => {
		// First create a person
		request(app)
			.post("/api/people")
			.send({ name: "Test Person" })
			.expect(200)
			.end((err, personRes) => {
				if (err) return done(err);
				const personId = personRes.body.id;

				request(app)
					.post("/api/checkins")
					.send({
						person_id: personId,
						duration: "30 minutes",
						notes: "Good conversation",
					})
					.expect(200)
					.end((err2, res) => {
						if (err2) return done(err2);
						expect(res.body).to.have.property("id");
						expect(res.body.person_id).to.equal(personId);
						done();
					});
			});
	});

	it("should get all checkins", (done) => {
		request(app)
			.get("/api/checkins")
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				expect(res.body).to.be.an("array");
				done();
			});
	});

	it("should get checkins for a person", (done) => {
		// First create a person
		request(app)
			.post("/api/people")
			.send({ name: "Test Person 2" })
			.expect(200)
			.end((err, personRes) => {
				if (err) return done(err);
				const personId = personRes.body.id;

				// Create a checkin
				request(app)
					.post("/api/checkins")
					.send({
						person_id: personId,
						duration: "1 hour",
					})
					.expect(200)
					.end((err2) => {
						if (err2) return done(err2);

						request(app)
							.get(`/api/checkins/person/${personId}`)
							.expect(200)
							.end((err3, res) => {
								if (err3) return done(err3);
								expect(res.body).to.be.an("array");
								expect(res.body.length).to.be.greaterThan(0);
								done();
							});
					});
			});
	});

	it("should update a checkin", (done) => {
		// First create a person and checkin
		request(app)
			.post("/api/people")
			.send({ name: "Test Person 3" })
			.expect(200)
			.end((err, personRes) => {
				if (err) return done(err);
				const personId = personRes.body.id;

				request(app)
					.post("/api/checkins")
					.send({
						person_id: personId,
						duration: "30 minutes",
					})
					.expect(200)
					.end((err2, checkinRes) => {
						if (err2) return done(err2);
						const checkinId = checkinRes.body.id;

						request(app)
							.put(`/api/checkins/${checkinId}`)
							.send({
								person_id: personId,
								duration: "45 minutes",
							})
							.expect(200)
							.end((err3, res) => {
								if (err3) return done(err3);
								expect(res.body.duration).to.equal("45 minutes");
								done();
							});
					});
			});
	});

	it("should delete a checkin", (done) => {
		// First create a person and checkin
		request(app)
			.post("/api/people")
			.send({ name: "Test Person 4" })
			.expect(200)
			.end((err, personRes) => {
				if (err) return done(err);
				const personId = personRes.body.id;

				request(app)
					.post("/api/checkins")
					.send({
						person_id: personId,
						duration: "1 hour",
					})
					.expect(200)
					.end((err2, checkinRes) => {
						if (err2) return done(err2);
						const checkinId = checkinRes.body.id;

						request(app)
							.delete(`/api/checkins/${checkinId}`)
							.expect(200)
							.end((err3, res) => {
								if (err3) return done(err3);
								expect(res.body.deleted).to.be.true;
								done();
							});
					});
			});
	});
});
