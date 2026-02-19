import axios from "axios";

const getJudgeClient = () => {
  const baseURL = (process.env.JUDGE0_BASE_URL || "").trim();

  if (!/^https?:\/\//i.test(baseURL)) {
    throw new Error(
      `JUDGE0_BASE_URL is invalid: "${process.env.JUDGE0_BASE_URL || ""}". Set it like https://ce.judge0.com in .env`
    );
  }

  return axios.create({
    baseURL,
    timeout: 30000,
    headers: { "Content-Type": "application/json" }
  });
};

export const runOnJudge0Wait = async ({ source_code, language_id, stdin }) => {
  const judge0 = getJudgeClient();
  const { data } = await judge0.post(
    "/submissions?base64_encoded=false&wait=true&fields=stdout,stderr,compile_output,message,status,time,memory",
    { source_code, language_id, stdin }
  );
  return data;
};
