import { useState } from 'react'
import axios from 'axios'

import "./assets/style.css";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function App() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })

  const [isAuth, setIsAuth] = useState(false);

  const [products, setProducts] = useState([]);
  const [tempProduct, setTempProduct] = useState(null);

  const handleInputChange = (e) =>{
    const {name, value} = e.target;
    setFormData((preData)=>({
      ...preData,
      [name]: value,
    }));
  };

  const getProducts = async() =>{
    try {
      const response = axios.get(`${API_BASE}/api/${API_PATH}/admin/products`)
      setProducts((await response).data.products);
    } catch (error) {
      console.log(error.response);
    }
  }

  const onSubmit = async(e) =>{
    try{
      e.preventDefault(); //停止原生的預設事件
      const response = await axios.post(`${API_BASE}/admin/signin`,formData)
      //解構取出 Token,expired
      const {token, expired} = response.data;
      // 設定 Cookie
      document.cookie = `hexToken=${token};expires=${new Date(expired)};`;
      // 將 Token 設定到 axios 的預設 Header
      axios.defaults.headers.common['Authorization'] = token;

      getProducts(); //取得產品列表
      setIsAuth(true); //登入成功畫面為 true
    }catch(error){
      setIsAuth(false); //登入失敗畫面為 false
      console.log(error.response);
    }
  }

  const checkLogin = async()=>{
    try {
      // 讀取 Cookie
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("hexToken="))
        ?.split("=")[1];
      // 將 Token 設定到 axios 的預設 Header
      axios.defaults.headers.common['Authorization'] = token;

      const response = await axios.post(`${API_BASE}/api/user/check`)
      console.log(response.data);
    } catch (error) {
      console.log(error.response?.data.message);
    }
  }

  return (
    <>
    {!isAuth ? (
      <div className="container login">
        <h1 className="text-white">請先登入</h1>
        <form className="form-floating" onSubmit={(e)=>onSubmit(e)}>
          <div className="form-floating mb-3">
            <input type="email" className="form-control" name="username" placeholder="name@example.com" value={formData.username} onChange={(e)=>handleInputChange(e)} />
            <label htmlFor="username">Email address</label>
          </div>
          <div className="form-floating">
            <input type="password" className="form-control" name="password" placeholder="Password" value={formData.password} onChange={(e)=>handleInputChange(e)} />
            <label htmlFor="password">Password</label>
          </div>
          <button type="submit" className="btn btn-dark w-100 mt-3">登入</button>
        </form>
      </div>):(
        <div className="container">
          <button className="btn btn-danger mt-4" type="button" onClick={() => checkLogin()}>
            確認是否登入
          </button>
          <div className="row mt-4">
            <div className="col-md-6">
              <h2>產品列表</h2>
              <table className="table table-striped text-center">
                <thead>
                  <tr>
                    <th scope="col">產品名稱</th>
                    <th scope="col">原價</th>
                    <th scope="col">售價</th>
                    <th scope="col">是否啟用</th>
                    <th scope="col">查看細節</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    products.map((product) => {
                      return(
                        <tr key={product.id}>
                          <th scope="row">{product.title}</th>
                          <td>{product.origin_price}</td>
                          <td>{product.price}</td>
                          <td>{product.is_enabled ? <span className="text-primary">啟用</span>: <span className="text-danger">未啟用</span>}</td>
                          <td>
                            <button type="button" className="btn btn-dark" onClick={() => setTempProduct(product)}>查看細節</button>
                          </td>
                        </tr>
                      )
                    })
                  }
                </tbody>
              </table>
            </div>
            <div className="col-md-6">
              <h2>產品明細</h2>
              {
                tempProduct ?(
                  <div className="card">
                    <div className="row g-0">
                      <div className="col-md-5">
                        <img src={tempProduct.imageUrl} className="img-fluid rounded-start img-thumbnail" alt="主圖" />
                      </div>
                      <div className="col-md-7">
                        <div className="card-body text-start">
                          <h5 className="card-title fw-bold">{tempProduct.title}</h5>
                          <p className="card-text">商品描述：{tempProduct.description}</p>
                          <p className="card-text">商品內容：{tempProduct.content}</p>
                          <div className="d-flex">
                            價格：<del className="text-secondary">{tempProduct.origin_price}</del> 元 / {tempProduct.price} 元
                          </div>
                          <h5 className="card-title fw-bold mt-2">更多圖片：</h5>
                          <div className="d-flex overflow-auto">
                            {
                              tempProduct.imagesUrl.map((url,index)=>{
                                return <img key={index} src={url} className="images object-fit img-thumbnail" alt="副圖" />
                              })
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ):(<p className="text-light fs-3">請選擇產品</p>)
              }
            </div>
          </div>
        </div>
      )
    }
    </>
  )
}

export default App
