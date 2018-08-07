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
 **/
if (!defined('_PS_VERSION_'))
    exit;

class LimitQuantityForVirtualProducts extends Module
{

    public function __construct()
    {
        $this->name = 'limitquantityforvirtualproducts';
        $this->tab = 'front_office_features';
        $this->need_instance = 0;

        parent::__construct();

        $this->displayName = $this->l('Limit virtual product quantity');
        $this->description = $this->l('Limit virtual product quantity so buyer can\'t have more than one of the same product in its cart.');

        $this->version = '1.0.0';
        $this->author = 'contact@seb7.fr';
        $this->ps_versions_compliancy = array('min' => '1.5', 'max' => '1.6.999.999');
    }




    private function registerTranslations()
    {
        $this->l('You can\'t have more than one virtual product with the same reference');
    }

    public function getContent()
    {
        return "<h1>{$this->displayName}</h1>"
                . '<p>' . $this->l('This module is licenced under the Apache License 2.0, see LICENSE file included in this module folder') . '</p>'
                . '<p>' . $this->l('You can contact the developper for further developpements or for purshasing the pro version : contact@seb7.fr') . '</p>'
                . '<p>' . $this->l('The pro version allow for selected products not to be limited in quantity.') . '</p>'
        ;
    }




































}
