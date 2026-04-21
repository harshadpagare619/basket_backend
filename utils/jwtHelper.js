const { expressjwt: jwt } = require("express-jwt");

function authJwt() {
  const secret = process.env.JSON_WEB_TOKEN_SECRET_KEY;

  return jwt({
    secret,
    algorithms: ["HS256"],
  }).unless({
    path: [
      // PUBLIC GET ROUTES 
      { url: /\/api\/products(\/)?/, methods: ["GET"] },
      { url: /\/api\/products(\/)?/, methods: ["POST"] },
      { url: /\/api\/products(\/)?/, methods: ["PUT"] },
      { url: /\/api\/products(\/)?/, methods: ["DELETE"] },
      { url: /\/api\/category(\/)?/, methods: ["GET"] },
      { url: /\/api\/category(\/)?/, methods: ["POST"] },
      { url: /\/api\/category(\/)?/, methods: ["PUT"] },
      { url: /\/api\/category(\/)?/, methods: ["DELETE"] },
      { url: /\/api\/brands(\/)?/, methods: ["GET"] },
      { url: /\/api\/brands(\/)?/, methods: ["POST"] },
      { url: /\/api\/brands(\/)?/, methods: ["PUT"] },
      { url: /\/api\/brands(\/)?/, methods: ["DELETE"] },

      
      //  USER AUTH ROUTES 
      { url: /\/api\/users\/signup/, methods: ["POST"] },
      { url: /\/api\/users\/signin/, methods: ["POST"] },
      { url: /\/api\/users\/authWithGoogle/, methods: ["POST"] },

      //  ADMIN AUTH ROUTES 
      { url: /\/api\/moderators\/signin(\/)?/, methods: ["POST"] },
      { url: /\/api\/moderators\/signup(\/)?/, methods: ["POST"] },
    ],
  });
}

module.exports = authJwt;