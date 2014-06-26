'use strict';

var should = require('should'),
    request = require('supertest'),
    app = localrequire.express();

var token;
var id;

var create = function() {
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
};

var remove = function() {
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
          name: 'Test User',
          phone: '010-1234-5678'
        });
        done();
      });
  });
};

describe('Session APIs', function() {
  describe('POST /session', function() {
    create();

    it('should be able to login', function(done) {
      request(app)
        .post('/session')
        .send({
          email: 'test@test.com',
          password: 'test'
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
          done();
        });
    });

    it('should return 401 for non-existing user id', function(done) {
      request(app)
        .post('/session')
        .send({
          email: 'test1@test.com',
          password: 'test'
        }).expect(401)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.error.code.should.be.eql('UNAUTHORIZED');
          should.exist(res.body.error.message);
          done();
        });
    });

    it('should return 401 for invalid password', function(done) {
      request(app)
        .post('/session')
        .send({
          email: 'test@test.com',
          password: 'test1'
        }).expect(401)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.error.code.should.be.eql('UNAUTHORIZED');
          should.exist(res.body.error.message);
          done();
        });
    });

    remove(token);
  });

  describe('GET /session', function() {
    create();

    it('should be able to get me', function(done) {
      request(app)
        .get('/session')
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

    it('should return 401 without token', function(done) {
      request(app)
        .get('/session')
        .expect(401)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.error.code.should.be.eql('UNAUTHORIZED');
          should.exist(res.body.error.message);
          done();
        });
    });

    remove(token);
  });

  describe('DELETE /session', function() {
    create();

    it('should be able to logout', function(done) {
      request(app)
        .del('/session')
        .set('Authorization', 'Bearer ' + token)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.be.eql({});
          done();
        });
    });

    remove(token);
  });
});
