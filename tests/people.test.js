const { expect } = require("chai");
const request = require("supertest");
const { app } = require("../backend/server");

describe("People API", () => {
	it("should create a new person", (done) => {
		request(app)
			.post("/api/people")
			.send({
				name: "John Doe",
				birthday: "1990-01-01",
				preferred_communication: "Email",
			})
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				expect(res.body).to.have.property("id");
				expect(res.body.name).to.equal("John Doe");
				done();
			});
	});

	it("should get all people", (done) => {
		request(app)
			.get("/api/people")
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				expect(res.body).to.be.an("array");
				done();
			});
	});

	it("should update a person", (done) => {
		// First create a person
		request(app)
			.post("/api/people")
			.send({ name: "Jane Doe" })
			.expect(200)
			.end((err, createRes) => {
				if (err) return done(err);
				const personId = createRes.body.id;

				request(app)
					.put(`/api/people/${personId}`)
					.send({
						name: "Jane Smith",
						preferred_communication: "Call",
					})
					.expect(200)
					.end((err2, res) => {
						if (err2) return done(err2);
						expect(res.body.name).to.equal("Jane Smith");
						done();
					});
			});
	});

	it("should delete a person", (done) => {
		// First create a person
		request(app)
			.post("/api/people")
			.send({ name: "Test Person" })
			.expect(200)
			.end((err, createRes) => {
				if (err) return done(err);
				const personId = createRes.body.id;

				request(app)
					.delete(`/api/people/${personId}`)
					.expect(200)
					.end((err2, res) => {
						if (err2) return done(err2);
						expect(res.body.deleted).to.be.true;
						done();
					});
			});
	});
});
