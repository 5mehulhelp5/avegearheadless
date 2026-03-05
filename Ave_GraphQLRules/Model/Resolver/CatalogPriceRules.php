<?php
namespace Ave\GraphQLRules\Model\Resolver;

use Magento\Framework\GraphQl\Config\Element\Field;
use Magento\Framework\GraphQl\Query\ResolverInterface;
use Magento\Framework\GraphQl\Schema\Type\ResolveInfo;
use Magento\CatalogRule\Model\ResourceModel\Rule\CollectionFactory;

class CatalogPriceRules implements ResolverInterface
{
    protected $ruleCollectionFactory;

    public function __construct(CollectionFactory $ruleCollectionFactory)
    {
        $this->ruleCollectionFactory = $ruleCollectionFactory;
    }

    public function resolve(
        Field $field,
        $context,
        ResolveInfo $info,
        array $value = null,
        array $args = null
    ) {
        $collection = $this->ruleCollectionFactory->create();
        $collection->addFieldToFilter('is_active', 1);

        $rules = [];
        foreach ($collection as $rule) {
            $rules[] = [
                'rule_id' => $rule->getId(),
                'name' => $rule->getName(),
                'description' => $rule->getDescription(),
                'from_date' => $rule->getFromDate(),
                'to_date' => $rule->getToDate(),
                'is_active' => (bool) $rule->getIsActive(),
                'conditions_serialized' => $rule->getConditionsSerialized(),
                'actions_serialized' => $rule->getActionsSerialized(),
                'stop_rules_processing' => (bool) $rule->getStopRulesProcessing(),
                'sort_order' => $rule->getSortOrder(),
                'simple_action' => $rule->getSimpleAction(),
                'discount_amount' => $rule->getDiscountAmount()
            ];
        }

        return ['items' => $rules];
    }
}
