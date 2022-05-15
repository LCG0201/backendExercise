console.log("client code running");
const axios = require("axios");

const URI = "http://localhost:3000";

//비효율적인 방법
//  약 1초걸린다(블로그20개 기준)
const test = async () => {
  console.time("time:");
  let {
    data: { blogs },
  } = await axios.get(`${URI}/blog`);

  blogs = await Promise.all(
    blogs.map(async (blog) => {
      try {
        const [res1, res2] = await Promise.all([
          axios.get(`${URI}/user/${blog.user}`),
          axios.get(`${URI}/blog/${blog._id}/comment`),
        ]);
        blog.user = res1.data.user;
        blog.comments = res2.data.comments;
      } catch (error) {
        console.log({ error: error });
      }

      return blog;
    })
  );

  console.timeEnd("time:");
};

//좀더 나은 방법
//  약 0.1초 초중반(블로그20개 기준)
//    mongoose의 기능으로 동일한 user id는 한번만 호출함으로써 통신단축
const test2 = async () => {
  console.time("time:");
  let {
    data: { users },
  } = await axios.get(`${URI}/user`);
  console.timeEnd("time:");
};

const timetest = async () => {
  await test2();
  // await test2();
  // await test2();
  // await test2();
  // await test2();
};

timetest();
