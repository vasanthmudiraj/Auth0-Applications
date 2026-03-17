let auth0Client = null;
let config=null;

const fetchAuthConfig = () => fetch("/auth_config.json");

const configureClient = async () => {
  const response = await fetchAuthConfig();
  config = await response.json();

  auth0Client = await auth0.createAuth0Client({
    domain: config.domain,
    clientId: config.clientId,
    audience: config.audience,
    cacheLocation: "localstorage"
  });
};

const accessFictionBooks=async()=> {
  try {
    await auth0Client.loginWithRedirect({
      authorizationParams:{
        audience:"https://api.booklibrarydigital.com",
        scope:"read:books",
        redirect_uri: window.location.origin+"#fiction-books",
        response_type: "code"
      }
    });
  }
  catch(e) {
    console.error("Step-up auth failed:",e);
    alert("Re-authentication required to access Story Books.");
  }
};

async function sendVerificationLink() {
  alert("Email verification link sent");

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.sub) throw new Error("User ID missing");
  } catch (e) {
    console.warn("User not found or invalid user object");
    return;
  }

  const AUTH0_DOMAIN = 'https://salmon-alligator-17213.cic-demo-platform.auth0app.com'; 
  const token ='';  
     const response = await fetch(
      `${AUTH0_DOMAIN}/api/v2/jobs/verification-email`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.sub,
        }),
      },
    );

}
const updateUI = async () => {
    const isAuthenticated = await auth0Client.isAuthenticated();

    document.getElementById("btn-login").classList.toggle("hidden",isAuthenticated);
    document.getElementById("btn-logout").classList.toggle("hidden",!isAuthenticated);
    document.getElementById("nav-profile").classList.toggle("hidden",!isAuthenticated);
    document.getElementById("nav-books").classList.toggle("hidden",!isAuthenticated);

    showSection("home");
    
    if(isAuthenticated) {

        await auth0Client.getTokenSilently({ ignoreCache: true });
        const user=await auth0Client.getUser();
        localStorage.setItem("user", JSON.stringify(user));
        document.getElementById("user-name").textContent=user.name;
        document.getElementById("user-email").textContent=user.email;
        document.getElementById("login-time").textContent=new Date().toLocaleString();

        const emailVerified=user.email_verified;
        const verifyEmail=document.getElementById("verify-email-btn");
        const statusEmail=document.getElementById("email-verified-status");

        if(emailVerified) {
          verifyEmail.style.display = "none";
          statusEmail.textContent="Verified";
          statusEmail.style.color="green";
        }
        else {
          verifyEmail.style.display = "inline-block";
          statusEmail.textContent="Not Verified";
          statusEmail.style.color="red";
        }
    }
};

const login = async () => {
  await auth0Client.loginWithRedirect({
    authorizationParams: {
      redirect_uri: window.location.origin,
      response_type: "code"
    }
  });
};

const logout = () => {
  auth0Client.logout({
    logoutParams: {
      returnTo: window.location.origin
    }
  });
};

function showSection(sectionId) {
  const section=document.querySelectorAll(".content-section");
  section.forEach(sec=>sec.classList.add("hidden"));
  document.getElementById(sectionId).classList.remove("hidden");
}

window.onload = async () => {
    await configureClient();
    
    const query = window.location.search;
    if (query.includes("code=") && query.includes("state=")) {
        await auth0Client.handleRedirectCallback();
        window.history.replaceState({}, document.title, "/");
    }
    
    document.getElementById("btn-login").addEventListener("click", login);
    document.getElementById("btn-logout").addEventListener("click", logout);
    document.getElementById("verify-email-btn").addEventListener("click", sendVerificationLink);

    await updateUI();

    if (window.location.hash === "#fiction-books") {
      showSection("fiction-books");
    }
};