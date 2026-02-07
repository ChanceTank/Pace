const { expect } = require("chai");
const request = require("supertest");
const { app } = require("../backend/server");

describe("Covenant Types API", () => {
	it("should create a new covenant type", (done) => {
		request(app)
			.post("/api/covenant_types")
			.send({
				name: "Mentorship",
				description: "Mentoring relationships",
			})
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				expect(res.body).to.have.property("id");
				expect(res.body.name).to.equal("Mentorship");
				done();
			});
	});

	it("should get all covenant types", (done) => {
		request(app)
			.get("/api/covenant_types")
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				expect(res.body).to.be.an("array");
				done();
			});
	});

	it("should update a covenant type", (done) => {
		// First create a covenant type
		request(app)
			.post("/api/covenant_types")
			.send({ name: "Test Type" })
			.expect(200)
			.end((err, createRes) => {
				if (err) return done(err);
				const typeId = createRes.body.id;

				request(app)
					.put(`/api/covenant_types/${typeId}`)
					.send({
						name: "Updated Type",
						description: "Updated description",
					})
					.expect(200)
					.end((err2, res) => {
						if (err2) return done(err2);
						expect(res.body.name).to.equal("Updated Type");
						done();
					});
			});
	});

	it("should delete a covenant type", (done) => {
		// First create a covenant type
		request(app)
			.post("/api/covenant_types")
			.send({ name: "Type to Delete" })
			.expect(200)
			.end((err, createRes) => {
				if (err) return done(err);
				const typeId = createRes.body.id;

				request(app)
					.delete(`/api/covenant_types/${typeId}`)
					.expect(200)
					.end((err2, res) => {
						if (err2) return done(err2);
						expect(res.body.deleted).to.be.true;
						done();
					});
			});
	});
});
