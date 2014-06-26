'use strict';

var should = require('should'),
    request = require('supertest'),
    app = localrequire.express();

var token;
var id;

describe('User APIs', function() {
  it('should be able to create a user', function(done) {
    request(app)
      .post('/users')
      .send({
        email: 'test@test.com',
        password: 'test',
        name: 'Test User',
        phone: '010-1234-5678'
      }).expect(200)
      .expect('Content-Type', /json/)
      .expect('Auth-Token', /^.+$/)
      .end(function(err, res) {
        if (err) return done(err);
        should.exist(res.body.user);
        should.exist(res.body.user.id);
        res.body.user.should.be.containEql({
          email: 'test@test.com',
          name: 'Test User',
          phone: '010-1234-5678'
        });
        should.exist(res.body.token);
        token = res.get('Auth-Token');
        id = res.body.user.id;
        done();
      });
  });

  it('should be able to get the user', function(done) {
    request(app)
      .get('/users/' + id)
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        should.exist(res.body.user);
        should.exist(res.body.user.id);
        res.body.user.should.be.containEql({
          email: 'test@test.com',
          name: 'Test User',
          phone: '010-1234-5678'
        });
        done();
      });
  });

  it('should be able to get all users', function(done) {
    request(app)
      .get('/users')
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.users.should.be.an.instanceOf(Array).and.have.lengthOf(1);
        should.exist(res.body.users[0].id);
        res.body.users[0].should.be.containEql({
          email: 'test@test.com',
          name: 'Test User',
          phone: '010-1234-5678'
        });
        done();
      });
  });

  it('should be able to update a user', function(done) {
    request(app)
      .put('/users/' + id)
      .set('Authorization', 'Bearer ' + token)
      .send({
        password: 'test',
        name: 'New Test User',
        phone: '010-9876-5432'
      }).expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        should.exist(res.body.user);
        should.exist(res.body.user.id);
        res.body.user.should.be.containEql({
          email: 'test@test.com',
          name: 'New Test User',
          phone: '010-9876-5432'
        });

        request(app)
          .get('/users/' + id)
          .set('Authorization', 'Bearer ' + token)
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) return done(err);
            should.exist(res.body.user);
            should.exist(res.body.user.id);
            res.body.user.should.be.containEql({
              email: 'test@test.com',
              name: 'New Test User',
              phone: '010-9876-5432'
            });
            done();
          });
      });
  });

  it('should be able to delete the user', function(done) {
    request(app)
      .del('/users/' + id)
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        should.exist(res.body.user);
        should.exist(res.body.user.id);
        res.body.user.should.be.containEql({
          email: 'test@test.com',
          name: 'New Test User',
          phone: '010-9876-5432'
        });
        done();
      });
  });
});
