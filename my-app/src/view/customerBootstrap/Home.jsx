export default function Home() {
  return (
    // <div class="container-fluid ">
    //   <div class="row justify-content-center">
    //     <div class="col-12 col-sm-10 col-md-8 col-lg-4">
    //       <div class="card p-5">

    <>
      <h1 class="card-title text-center mb-4">Coffe</h1>
      <div className="row">
        <div class="card  mb-3">
          <div class="card-body">
            <h5 class="card-title">Coffe</h5>
            <p class="card-text">Open today, 00:00 - 23:59</p>
          </div>
        </div>
      </div>

      <div className="row">
        <div class="card  mb-3">
          <div class="card-body">
            {/* <h5 class="card-title">Coffe</h5>
                  <p class="card-text">Open today, 00:00 - 23:59</p> */}


            <div className="d-flex">
              <div style={{ width: "80%" }}>
                <input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="search" />
              </div>
              <div style={{ width: "20%" }} className="d-flex justify-content-center align-items-center ">
                <span class="badge rounded-pill text-bg-danger">Meja 18</span>
              </div>


            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div class="card mb-3" style={{ maxWidth: "540px" }}>
          <div class="row p-2 ">
            <div class="col-md-4 d-flex justify-content-center align-items-center">
              <div className="">
                <img src="https://easyeat.gumlet.io/menu_items/saturday/3bca8a22661f4abe8d5d573729348e2f/thumbnails/YJUabeFDrB.jpeg" class="img-fluid rounded" alt="..." />
              </div>
            </div>
            <div class="col-md-8">
              <div class="card-body">
                <h5 class="card-title">Latte</h5>
                {/* <span class="badge text-bg-danger">Best seller</span> */}
                <br />

                <div className="d-flex align-items-center justify-content-between ">
                  <span class="" style={{ fontSize: "20px", display: "block" }} >Rp 2500</span>
                  <button className="btn btn-secondary">Add</button>
                </div>
              </div>
            </div>
          </div>
        </div>


      </div></>


    //       </div>
    //     </div>
    //   </div>
    // </div>

  );
}   