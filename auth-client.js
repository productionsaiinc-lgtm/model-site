const AUTH_API = "https://model-site-alpha.vercel.app/api/auth";


async function signup(email, password) {

  try {

    const response = await fetch(`${AUTH_API}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    });


    return await response.json();


  } catch (error) {

    return {
      success: false,
      error: "Server connection failed"
    };

  }

}



async function login(email, password) {

  try {

    const response = await fetch(`${AUTH_API}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    });


    return await response.json();


  } catch (error) {

    return {
      success: false,
      error: "Server connection failed"
    };

  }

}



window.NovaAuth = {
  signup,
  login
};