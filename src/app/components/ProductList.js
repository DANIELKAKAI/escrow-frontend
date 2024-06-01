import React from "react";
import "./ProductList.css";

const ProductList = ({
    handleBuyClick,
    handleDepositClick,
    handleApproveClick,
}) => {
    const products = [
        {
            id: "111",
            name: "Product 1",
            image:
                "https://t4.ftcdn.net/jpg/06/11/66/83/360_F_611668398_2iGlPGojelZJDwcQ3ksSjhs3nEeyxeTZ.jpg",
            phone: "123-456-7890",
            price: 1,
        },
        {
            id: "112",
            name: "Product 2",
            image:
                "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?cs=srgb&dl=pexels-binyaminmellish-1396122.jpg&fm=jpg",
            phone: "098-765-4321",
            price: 1,
        },
        {
            id: "113",
            name: "Product 3",
            image:
                "https://img.freepik.com/free-photo/blue-house-with-blue-roof-sky-background_1340-25953.jpg?size=626&ext=jpg&ga=GA1.1.2082370165.1717027200&semt=ais_user",
            phone: "555-555-5555",
            price: 1,
        },
    ];

    return (
        <div className="product-list">
            {products.map((product) => (
                <div key={product.id} className="product-card">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="product-image"
                    />
                    <div className="product-info">
                        <h2 className="product-name">{product.name}</h2>
                        <p className="product-id">ID: {product.id}</p>
                        <p className="seller-phone">Seller: {product.phone}</p>
                    </div>
                    <div>
                        <button
                            className="buy-button"
                            onClick={() => handleBuyClick(product)}
                        >
                            Buy
                        </button>
                        <button
                            className="buy-button"
                            onClick={() => handleDepositClick(product)}
                        >
                            Deposit
                        </button>
                        <button
                            className="buy-button"
                            onClick={() => handleApproveClick(product)}
                        >
                            Approve
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProductList;
