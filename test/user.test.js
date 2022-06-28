process.env.NODE_ENV = 'test';
const chai = require('chai');
const expect = chai.expect;
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../server');


chai.use(chaiHttp);

describe('/User Collection', () => {
    //test ecomerce
    it('Welcome to Ecomerce....', (done) => {

        chai.request(server)
        .get('/')
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');    
            const actualVal = res.body.message;
            expect(actualVal).to.be.equal('Welcome to Ecomerce');        
            done();
        });
    });
    //test user login
    describe('/POST USER lOGIN', () => {
        let user = {
                    username: "ahmed",
                    password: "Ahmed12345"
        }
        it('it should login user', (done) => {
            chai.request(server)
            .post('/api/v1/login')
            .send(user)
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
             
        });
    });
      //test user register
    describe('/POST USER REGISTER', () => {
        let user = {
                    username: "ahmed",
                    password: "Ahmed12345",
                    email:"ahmed@gmail.com"
        }
        it('it should register user', (done) => {
            chai.request(server)
            .post('/api/v1/register')
            .send(user)
            .end((err, res) => {
                res.should.have.status(500);
                const actualVal = res.body.message;
                expect(actualVal).to.be.equal('User already Exists');  
                done();
            });
             
        });
    });
   
})