const router = require('express').Router()
const paypal = require("paypal-rest-sdk")
const paypalConfig = require("../config/paypal")

paypal.configure(paypalConfig)

const {products} = require ("../config/products");

let valor = {};

router.get('/', (req, res) => res.render ('index', { products }));

//comprar
router.post('/buy', (req, res) => {
    
    const productId = req.query.id;
    const product = products.reduce((all, item)=> item.id.toString() === productId ? item : all, {});
    if(!product.id) return res.render('index', { products });

    const carrinho = [{
        "name": product.titulo,
        "sku": product.id,
        "price": product.preco.toFixed(2),
        "currency": "USD",
        "quantity": 1
    }];

    valor = { "currency": "USD", "total": product.preco.toFixed(2)}

    const descricao = product.descricao;

    /* Não consegui implementar a funcionalidade de enviar o endereço, recebi sempre este erro:
    response: {
    name: 'MALFORMED_REQUEST',
    message: 'Incoming JSON request does not map to API request',
    information_link: 'https://developer.paypal.com/webapps/developer/docs/api/#MALFORMED_REQUEST',
    debug_id: 'e86530a7dd42e',
    httpStatusCode: 400
    },
    httpStatusCode: 400
    }

    Como declarei:

    const shippingaddress = {
            "shipping_address":{
                "recipient_name": "Brian Robinson",
                "line1": "4th Floor",
                "line2": "Unit #34",
                "city": "San Jose",
                "country_code": "US",
                "postal_code": "95131",
                "phone": "011862212345678",
                "state": "CA"
            }
        };
    */
        
    const json_pagamento = {
        "intent": "sale",
        "payer": { payment_method: "paypal"},
        "redirect_urls":{
            "return_url":"http://brunotaskpp-com.umbler.net/success",
            "cancel_url":"http://brunotaskpp-com.umbler.net/cancel"
        },
        "transactions": [{
            "item_list":{
                "items": carrinho
                //"shipping_address": shippingaddress
            },
            "amount": valor,
            "description": descricao,
        }]
    }
    paypal.payment.create(json_pagamento, (err, pagamento) => {
        if (err){
            console.warn(err)
        }
        else {
            pagamento.links.forEach((link) => {
                if(link.rel === 'approval_url') return res.redirect(link.href)
            })
        }
    } )

});

//pagar com sucesso
router.get('/success', (req,res) => {
    var payerId = { payer_id: req.query.PayerID };
    const paymentId = req.query.paymentId;

   
    const execute_payment_json = {
        //CRXC8J35WWYNC
        "payer_id": payerId,
        "transactions": [{
            "amount": valor
        }]
    }
    

    paypal.payment.execute(paymentId, payerId, function(error, payment){
        if(error){
          console.error(JSON.stringify(error));
          throw error
        } else {
          if (payment.state == 'approved'){
            console.log('Pagamento concluido com sucesso')
            res.render('success')

          } else {
            console.log('erro no pagamento');
          }
        }
      });

    
})

//cancelar
router.get('/cancel', (req, res) =>{
    res.render('cancel');
})

module.exports = router;