
<a id="0x1_reconfiguration_with_dkg"></a>

# Module `0x1::reconfiguration_with_dkg`

Reconfiguration with DKG.
Different from the default reconfiguration which is an instant state transition.


-  [Function `start`](#0x1_reconfiguration_with_dkg_start)
-  [Function `finish`](#0x1_reconfiguration_with_dkg_finish)
-  [Function `finish_with_dkg_result`](#0x1_reconfiguration_with_dkg_finish_with_dkg_result)


<pre><code><b>use</b> <a href="../../aptos-stdlib/../move-stdlib/doc/config_for_next_epoch.md#0x1_config_for_next_epoch">0x1::config_for_next_epoch</a>;
<b>use</b> <a href="consensus_config.md#0x1_consensus_config">0x1::consensus_config</a>;
<b>use</b> <a href="dkg.md#0x1_dkg">0x1::dkg</a>;
<b>use</b> <a href="execution_config.md#0x1_execution_config">0x1::execution_config</a>;
<b>use</b> <a href="../../aptos-stdlib/../move-stdlib/doc/features.md#0x1_features">0x1::features</a>;
<b>use</b> <a href="gas_schedule.md#0x1_gas_schedule">0x1::gas_schedule</a>;
<b>use</b> <a href="reconfiguration.md#0x1_reconfiguration">0x1::reconfiguration</a>;
<b>use</b> <a href="stake.md#0x1_stake">0x1::stake</a>;
<b>use</b> <a href="version.md#0x1_version">0x1::version</a>;
</code></pre>



<a id="0x1_reconfiguration_with_dkg_start"></a>

## Function `start`

Trigger a reconfiguration with DKG.
Abort if there is a DKG in progress.


<pre><code><b>public</b>(<b>friend</b>) <b>fun</b> <a href="reconfiguration_with_dkg.md#0x1_reconfiguration_with_dkg_start">start</a>(<a href="account.md#0x1_account">account</a>: &<a href="../../aptos-stdlib/../move-stdlib/doc/signer.md#0x1_signer">signer</a>)
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>public</b>(<b>friend</b>) <b>fun</b> <a href="reconfiguration_with_dkg.md#0x1_reconfiguration_with_dkg_start">start</a>(<a href="account.md#0x1_account">account</a>: &<a href="../../aptos-stdlib/../move-stdlib/doc/signer.md#0x1_signer">signer</a>) {
    <a href="../../aptos-stdlib/../move-stdlib/doc/config_for_next_epoch.md#0x1_config_for_next_epoch_disable_upserts">config_for_next_epoch::disable_upserts</a>(<a href="account.md#0x1_account">account</a>);
    <b>let</b> cur_epoch = <a href="reconfiguration.md#0x1_reconfiguration_current_epoch">reconfiguration::current_epoch</a>();
    <a href="dkg.md#0x1_dkg_start">dkg::start</a>(cur_epoch, <a href="stake.md#0x1_stake_cur_validator_set">stake::cur_validator_set</a>(), cur_epoch + 1, <a href="stake.md#0x1_stake_next_validator_set">stake::next_validator_set</a>());
}
</code></pre>



</details>

<a id="0x1_reconfiguration_with_dkg_finish"></a>

## Function `finish`

Apply buffered on-chain configs.
Re-enable on-chain config changes.
Trigger the default reconfiguration to enter the new epoch.


<pre><code><b>public</b>(<b>friend</b>) <b>fun</b> <a href="reconfiguration_with_dkg.md#0x1_reconfiguration_with_dkg_finish">finish</a>(<a href="account.md#0x1_account">account</a>: &<a href="../../aptos-stdlib/../move-stdlib/doc/signer.md#0x1_signer">signer</a>)
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>public</b>(<b>friend</b>) <b>fun</b> <a href="reconfiguration_with_dkg.md#0x1_reconfiguration_with_dkg_finish">finish</a>(<a href="account.md#0x1_account">account</a>: &<a href="../../aptos-stdlib/../move-stdlib/doc/signer.md#0x1_signer">signer</a>) {
    <a href="consensus_config.md#0x1_consensus_config_on_new_epoch">consensus_config::on_new_epoch</a>(<a href="account.md#0x1_account">account</a>);
    <a href="execution_config.md#0x1_execution_config_on_new_epoch">execution_config::on_new_epoch</a>(<a href="account.md#0x1_account">account</a>);
    <a href="gas_schedule.md#0x1_gas_schedule_on_new_epoch">gas_schedule::on_new_epoch</a>(<a href="account.md#0x1_account">account</a>);
    std::version::on_new_epoch(<a href="account.md#0x1_account">account</a>);
    <a href="../../aptos-stdlib/../move-stdlib/doc/features.md#0x1_features_on_new_epoch">features::on_new_epoch</a>(<a href="account.md#0x1_account">account</a>);
    <a href="../../aptos-stdlib/../move-stdlib/doc/config_for_next_epoch.md#0x1_config_for_next_epoch_enable_upserts">config_for_next_epoch::enable_upserts</a>(<a href="account.md#0x1_account">account</a>);
    <a href="reconfiguration.md#0x1_reconfiguration_reconfigure">reconfiguration::reconfigure</a>();
}
</code></pre>



</details>

<a id="0x1_reconfiguration_with_dkg_finish_with_dkg_result"></a>

## Function `finish_with_dkg_result`

Complete the current reconfiguration with DKG.
Abort if no DKG is in progress.


<pre><code><b>fun</b> <a href="reconfiguration_with_dkg.md#0x1_reconfiguration_with_dkg_finish_with_dkg_result">finish_with_dkg_result</a>(<a href="account.md#0x1_account">account</a>: &<a href="../../aptos-stdlib/../move-stdlib/doc/signer.md#0x1_signer">signer</a>, dkg_result: <a href="../../aptos-stdlib/../move-stdlib/doc/vector.md#0x1_vector">vector</a>&lt;u8&gt;)
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>fun</b> <a href="reconfiguration_with_dkg.md#0x1_reconfiguration_with_dkg_finish_with_dkg_result">finish_with_dkg_result</a>(<a href="account.md#0x1_account">account</a>: &<a href="../../aptos-stdlib/../move-stdlib/doc/signer.md#0x1_signer">signer</a>, dkg_result: <a href="../../aptos-stdlib/../move-stdlib/doc/vector.md#0x1_vector">vector</a>&lt;u8&gt;) {
    <b>let</b> should_finish = <a href="dkg.md#0x1_dkg_update">dkg::update</a>(<b>true</b>, dkg_result);
    <b>if</b> (should_finish) {
        <a href="reconfiguration_with_dkg.md#0x1_reconfiguration_with_dkg_finish">finish</a>(<a href="account.md#0x1_account">account</a>);
    }
}
</code></pre>



</details>


[move-book]: https://aptos.dev/move/book/SUMMARY
