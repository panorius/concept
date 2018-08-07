<?php
/**
 * Smarty plugin
 * File:     function.sql_parties_query.php
 * Type:     function
 * Name:     sql_parties_query
 * Purpose:  Prints the dropdowns for date selection.
 */
function smarty_function_sql_parties_query($params, &$smarty)
{
    static $sql = 'SELECT * FROM _parties';

    $query = Db::getInstance()->executeS($sql);

    $fname = Context::getContext()->customer->firstname;

    if ($query == true) {
        foreach ($query as $row) {
            if ($row['nb_joueurs'] != $row['max_joueurs']) {
                echo "<div class='div-table-row places-dispo'>
               <div class='div-table-col first-child'><strong>{$row['titre']}</strong></div>
              <div class='div-table-col w020'><i>{$fname}</i></div>
              <div class='div-table-col w020'>{$row['nb_joueurs']} / {$row['max_joueurs']}</div>
              <div class='div-table-col w020'>{$row['difficulte']}</div>";
                if ($row['code_acces'] != null) {
                    echo "<div class=\"div-table-col w020\"><i class=\"icon-mdp-h18 left\"></i></div></div>";
                } else {
                    echo "<div class=\"div-table-col w020\" ><i class=\"icon-nomdp-h18 left\"></i></div></div>";
                }
            } else {
                echo "<div class='div-table-row places-indispo'><div class='div-table-col first-child'><strong>{$row['titre']}</strong></div>
              <div class='div-table-col w020'><i>None</i></div>
              <div class='div-table-col w020'>{$row['nb_joueurs']} / {$row['max_joueurs']}</div>";
                if ($row['code_acces'] != null) {
                    echo "<div class=\"div-table-col w020\"><i class=\"icon-mdp-h18 left\"></i></div></div>";
                } else {
                    echo "<div class=\"div-table-col w020\" ><i class=\"icon-nomdp-h18 left\"></i></div></div>";
                }
            }
        }
    } else {
        echo "<div class='div-table-col w100'>Veuillez créer un sallon pour commencer...{$fname}</div>";
    }
}