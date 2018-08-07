<?php
/**
 * LimitQuantityForVirtualProducts
 *
 * Limit virtual product quantity so buyer can't have more than one of the same product in its cart.
 * 
 * @author    sebastienmonterisi@yahoo.fr
 * @copyright (c) 2015, Sébastien Monterisi
 * @license   Apache License 2.0 - see LICENCE file - http://choosealicense.com/licenses/apache-2.0/ 
 * @build     05 Mar 2015 - 10:26
 * */
class CartController extends CartControllerCore
{
    /*
    * module: limitquantityforvirtualproducts
    * date: 2016-01-10 20:15:39
    * version: 1.0.0
    */
    private $s7_lqvp_product = null;
    /*
    * module: limitquantityforvirtualproducts
    * date: 2016-01-10 20:15:39
    * version: 1.0.0
    */
    public function init()
    {
        parent::init();
        $this->s7_lqvp_init();
    }
    /*
    * module: limitquantityforvirtualproducts
    * date: 2016-01-10 20:15:39
    * version: 1.0.0
    */
    protected function processChangeProductInCart()
    {
        if (!$this->s7_lqvp_allowProcessChangeProductInCart())
        {
            return;
        }
        parent::processChangeProductInCart();
    }
    /*
    * module: limitquantityforvirtualproducts
    * date: 2016-01-10 20:15:39
    * version: 1.0.0
    */
    private function s7_lqvp_init()
    {
        $this->s7_lqvp_instanciateProduct();
        $this->s7_lqvp_addErrorIfQuantityAboveOneForVirtualProduct();
    }
    /*
    * module: limitquantityforvirtualproducts
    * date: 2016-01-10 20:15:39
    * version: 1.0.0
    */
    private function s7_lqvp_addErrorIfQuantityAboveOneForVirtualProduct()
    {
        if (!$this->s7_lqvp_productIsVirtual() || !$this->s7_lqvp_addingProducts())
        {
            return;
        }
        if ($this->s7_lqvp_tryingToAddMoreThanOne() || $this->s7_lqvp_productAlreadyInCart())
        {
            $this->errors[] = Tools::displayError(Translate::getModuleTranslation(
                                    'limitquantityforvirtualproducts', "You can't have more than one virtual product with the same reference", 'limitquantityforvirtualproducts')
            );
        }
    }
    /*
    * module: limitquantityforvirtualproducts
    * date: 2016-01-10 20:15:39
    * version: 1.0.0
    */
    private function s7_lqvp_instanciateProduct()
    {
        if (!$this->id_product)
        {
            return;
        }
        $this->s7_lqvp_product = new Product($this->id_product);
    }
    /*
    * module: limitquantityforvirtualproducts
    * date: 2016-01-10 20:15:39
    * version: 1.0.0
    */
    private function s7_lqvp_allowProcessChangeProductInCart()
    {
        if (!empty($this->errors))
        {
            die(implode(',', $this->errors));
        }
        return true;
    }
    /*
    * module: limitquantityforvirtualproducts
    * date: 2016-01-10 20:15:39
    * version: 1.0.0
    */
    private function s7_lqvp_productAlreadyInCart()
    {
        if (!$this->id_product)
        {
            return false;
        }
        $contains = $this->context->cart->containsProduct($this->id_product);
        return (is_array($contains) && array_shift($contains) != 0);
    }
    /*
    * module: limitquantityforvirtualproducts
    * date: 2016-01-10 20:15:39
    * version: 1.0.0
    */
    private function s7_lqvp_tryingToAddMoreThanOne()
    {
        return $this->qty > 1;
    }
    /*
    * module: limitquantityforvirtualproducts
    * date: 2016-01-10 20:15:39
    * version: 1.0.0
    */
    private function s7_lqvp_productIsVirtual()
    {
        return $this->s7_lqvp_product && $this->s7_lqvp_product->is_virtual;
    }
    /*
    * module: limitquantityforvirtualproducts
    * date: 2016-01-10 20:15:39
    * version: 1.0.0
    */
    private function s7_lqvp_addingProducts()
    {
        if (Tools::getValue('op', false) == 'down')
        {
            return false;
        }
        return Tools::getIsset('add');
    }
}
